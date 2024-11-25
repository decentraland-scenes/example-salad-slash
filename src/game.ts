import { ColliderLayer, engine, Entity, InputAction, inputSystem, Material, MaterialTransparencyMode, MeshRenderer, PointerEventType, RaycastQueryType, raycastSystem, Transform, VisibilityComponent } from "@dcl/sdk/ecs";
import { GAME_STATE, GameStateData } from "./gameState";
import { syncEntity } from "@dcl/sdk/network";
//import { GridMap } from "./grid";
import { Color3, Color4, Quaternion, Vector3 } from "@dcl/sdk/math";

import { movePlayerTo } from "~system/RestrictedActions";
import { _FLYING_OBJECTS, BOARD_DECAL_PLANE_OFFSET, FRUIT_PLANE_OFFSET, GRAVITY, SCENE_ROTATION, sceneParentEntity } from "./globals";
import { lockPlayer, unlockPlayer } from "./lockPlayer";
//import { NextBlockDisplay } from "./nextBlockDisplay";
import { SoundBox } from "./soundbox";
import { MusicPlayer } from "./music";
import { MainMenu } from "./menu";
import * as utils from "@dcl-sdk/utils"
import { shuffle } from "./modules/utilities";
import { FlyingObjectPool } from "./objectPool";
import { SplashSpawner, SplatDecalSpawner, splatSystem } from "./splat";
import { explosionSystem, FlyingObject, sliceObject } from "./vegetables";
import { HasTrail, Trail, trailUpdate } from "./trail";
import { Recipe, RecipeUI } from "./recipe";
import { _LEVELS } from "./levelData";
import { floatingMessageSystem, spawnFloatingMessage } from "./floatingMessages";
import { ClickBlocker } from "./clickBlocker";
import * as ui from "./ui"
//import { SCOREBOARD_VALUE_TYPE } from "@dcl-sdk/mini-games/src/ui";

type ProgressKey = 'level' | 'score' | 'moves' | 'time'

// const userProgress = await progress.getProgress('level', progress.SortDirection.DESC, 1)
// console.log(JSON.stringify(userProgress))

export let gameStateEntity:Entity

export class Game {
    // private readonly _canvas : HTMLCanvasElement;
    // private readonly _ctx : CanvasRenderingContext2D;

    objectPool:FlyingObjectPool    
    trailManager:Trail
    //nextBlockDisplay: NextBlockDisplay
    soundBox:SoundBox
    musicPlayer:MusicPlayer
    mainMenu:MainMenu   
    rayCastEntity:Entity 
    cursor:Entity
    trailStarting:Boolean = false
    currentRecipe:Recipe
    recipeUI:RecipeUI
    recipeDisplayRoot:Entity
    splashSpawner:SplashSpawner
    splatDecalSpawner:SplatDecalSpawner
    clickBlocker:ClickBlocker
    
   
  
    private readonly _DEFAULT_SPEED = 2.1;    
    private _score = 0;
    levelLimits = [5,10,15,20,25,30,35,40]
    linesCleared:number = 0
    elapsedTime:number =0
    clearTime:number = 0
    clearDuration:number = 0.4
    showScoreTime:number = 0
    linesToBeCleared:number[] = []
   // score:number = 0
    mousePressed:boolean = false
    comboTimer:number = 0
    comboCount:number = 0
    comboActive:boolean = false
    comboThreshold:number = 0.5
    //comboBar:Entity //DEBUG

  
    public constructor() {
      //this._canvas = document.querySelector(selector) as HTMLCanvasElement;
     // this._ctx = this._canvas.getContext('2d');
  
    
     gameStateEntity = engine.addEntity()

      GameStateData.createOrReplace(gameStateEntity, {
         // cells: [],           
          roundTime: 30,            
          sfxOn:true,
          currentLevel:0,           
          elapsedTime: 0,
          maxLevel:6,
          currentSpeed: this._DEFAULT_SPEED,
          state:GAME_STATE.IDLE,
          lives: 3,
          score:0
          
  
  
      })
     // multiPlayer && syncEntity(gameStateEntity, [ GameStateData.componentId], 500000)

      this.clickBlocker = new ClickBlocker(sceneParentEntity)

      this.objectPool = new FlyingObjectPool( {
        //parent:miniGames.sceneParentEntity,
        //position: Vector3.create(-6, 1, 0), 
        rotation: Quaternion.fromEulerDegrees(0,SCENE_ROTATION,0)   
      },
      sceneParentEntity
      )

      this.trailManager = new Trail(this.objectPool.root)

      this.rayCastEntity = engine.addEntity()
      this.cursor = engine.addEntity()
      MeshRenderer.setSphere(this.cursor)
      Transform.create(this.cursor,
        {scale: Vector3.create(0.25, 0.25, 0.25)}
      )
      HasTrail.createOrReplace(this.cursor, {
        saveTimer:0,
        saveFreq: 0.025,
        lastPos: Vector3.Zero()
    })
    Material.setPbrMaterial(this.cursor, {
      albedoColor: Color4.fromInts(255, 255  * 2, 255  * 0.1, 255  * 0.5),
      //transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
      emissiveColor: Color3.fromInts(255, 255 * 2, 255 * 0.4),
      //emissiveColor: Color3.fromInts(255,255 *0.8, 255 * 0.4),
      emissiveIntensity: 1
    })
    VisibilityComponent.createOrReplace(this.cursor, {visible: true})

   // multiPlayer && syncEntity (this.cursor, [Transform.componentId], 100011)
    
    //SPLASH HANDLER
    this.splashSpawner = new SplashSpawner(this.objectPool.root)

    //SPLAT DECALS
    this.splatDecalSpawner = new SplatDecalSpawner(this.objectPool.root)

      // MAIN MENU
      this.mainMenu = new MainMenu(this)       
      this.mainMenu.countdown.hide() 

         
      //RECIPES

      this.recipeDisplayRoot = engine.addEntity()
      Transform.create(this.recipeDisplayRoot, {
        position: Vector3.create(5,7,-8.2),
        rotation:Quaternion.fromEulerDegrees(0,180,0),
        parent: sceneParentEntity
      })
      this.currentRecipe = new Recipe(_LEVELS[0])    
      this.recipeUI = new RecipeUI(this.recipeDisplayRoot)

      this.recipeUI.applyRecipe(this.currentRecipe)
     

      //MUSIC
      this.musicPlayer = new MusicPlayer()
      this.soundBox = new SoundBox() 


      //DEBUG COMBO
      // this.comboBar = engine.addEntity()
      // Transform.create(this.comboBar,{
      //   position: Vector3.create(6,5,-7),
      //   parent:miniGames.sceneParentEntity,
      //   scale:Vector3.create(10,0.5,0.5)
      // })
      // MeshRenderer.setBox(this.comboBar)

      engine.addSystem(splatSystem)
      engine.addSystem(trailUpdate)
      engine.addSystem(explosionSystem)
      engine.addSystem(floatingMessageSystem)

      //UPDATE
      engine.addSystem((dt:number)=>{           

        switch(this.getState()){

          case GAME_STATE.MAIN_LOOP: {

            GameStateData.getMutable(gameStateEntity).gameTime +=dt

            this.elapsedTime +=  GameStateData.get(gameStateEntity).currentSpeed * dt

            let shouldRender = false
            if(this.elapsedTime > 2){           
              
             this.objectPool.spawnVegetable( 12 )           
              this.elapsedTime = Math.random()               
               
            }   

            this.update(dt)
            
              break;
          }       

          case GAME_STATE.SHOW_SCORE: {
            this.showScoreTime +=dt
            this.update(dt)
            if(this.showScoreTime > 3){
              console.log("SHOW SCORE STATE")              
              this.exitPlayer()         

            }
            break;
          }
        }
        

      })     
    }   

    update(dt:number){

      if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN)){
        this.mousePressed = true 
        this.trailStarting = true

      }
      if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_UP)){
        this.mousePressed = false
        this.comboActive = false
        this.comboTimer = 0
        this.comboCount = 0
      }
      
      if(this.mousePressed){

        if(this.comboActive){
          this.comboTimer +=dt
         
          if(this.comboTimer > this.comboThreshold){
            this.comboActive = false
            this.comboTimer = 0
            this.comboCount = 0
          }
        }

        const result = raycastSystem.registerRaycast(
         engine.CameraEntity,
          raycastSystem.localDirectionOptions({
            collisionMask: ColliderLayer.CL_CUSTOM1,
            //originOffset: Transform.get(engine.PlayerEntity).position,
            maxDistance: 18,
            queryType: RaycastQueryType.RQT_HIT_FIRST,
            direction: Vector3.Forward(),
            //  Vector3.rotate(
            //   Vector3.Forward(),
            //   Transform.get(engine.CameraEntity).rotation
            // ),
            continuous: true // don't overuse the 'continuous' property as raycasting is expensive on performance
          })
        )
        if (result){  
            
          if(result.hits ){
            
            if(result.hits.length > 0){

              if(result.hits[0].position){
                let hitPos = result.hits[0].position

                //console.log("POS: " + hitPos.x + ", " + hitPos.y + ", " + hitPos.z)  

                if(this.trailStarting){
                  Transform.getMutable(this.cursor).scale = Vector3.create(0.25, 0.25, 0.25)
                  this.trailStarting = false
                  Vector3.copyFrom(hitPos,  HasTrail.getMutable(this.cursor).lastPos)
                  VisibilityComponent.getMutable(this.cursor).visible = true
                  

                }
                Vector3.copyFrom(hitPos, Transform.getMutable(this.cursor).position)
              }
            }   
          }

        }
      }

      else{
        let cursorTransform = Transform.getMutable(this.cursor)

        if(cursorTransform.scale.y > 0.05){
          cursorTransform.scale = Vector3.scale(cursorTransform.scale, 0.9) 
        }
        else{
          cursorTransform.scale = Vector3.Zero()
        }
      }
      

      const flyingGroup = engine.getEntitiesWith(FlyingObject, Transform) 

      for (const [entity] of flyingGroup) {

          const transform = Transform.getMutable(entity)
          const flyInfo = FlyingObject.getMutable(entity)


          if(flyInfo.active){
              flyInfo.dir.y -= dt * GRAVITY                   

              transform.position = Vector3.add(transform.position, Vector3.scale(flyInfo.dir, dt) )
              transform.rotation = Quaternion.multiply(transform.rotation, Quaternion.fromEulerDegrees(0,0,100*flyInfo.rotationSpeed*dt) )   
              if(transform.position.y < -2){
                  flyInfo.active = false

                  if(flyInfo.splitable && this.isRequiredItem(flyInfo.shapeID)){
                    //this.decreaseLives()
                    this.changeScoreBy(-100)
                  }

                  if(flyInfo.disposable){                    
                      engine.removeEntity(entity)
                  }
              }

              //BOUNCES SIDES
              if(transform.position.x > 14 || transform.position.x < 2){
                  flyInfo.dir.x *= -0.5
              }

              //BOUNCES BOARD
              if(transform.position.z < 0.8 ){
                  flyInfo.dir.z *= -0.6
              }


              // SLICE BY CLICKING
              const cmd = inputSystem.getInputCommand(
                  InputAction.IA_POINTER,
                  PointerEventType.PET_DOWN,
                  entity
                )

                if (cmd) {                 
                  this.sliceObject(entity)
                }
                
               //SLICE BY SWIPING 
                const hover = inputSystem.getInputCommand(
                  InputAction.IA_POINTER,
                  PointerEventType.PET_HOVER_ENTER,
                  entity
                )
                
                if (hover) {
                 // console.log(hover.hit?.entityId)
                 console.log("HITPOS: " + hover.hit?.position)
                  if(this.mousePressed){
                    this.sliceObject(entity)                   
                  }                  
                }
          }
      }

    }
   

    sliceObject(entity:Entity){

      if(this.getState() == GAME_STATE.MAIN_LOOP){
        const flyInfo = FlyingObject.get(entity)
          // cut splash
          let originalTransform = Transform.getMutable(entity)
          this.splashSpawner.spawnSplash(originalTransform.position, originalTransform.rotation, flyInfo.parentEntity, _FLYING_OBJECTS[flyInfo.shapeID].color) 

          //splat decal
          let splatPos = Vector3.create(originalTransform.position.x, originalTransform.position.y, BOARD_DECAL_PLANE_OFFSET)
          this.splatDecalSpawner.spawnSplat(splatPos, flyInfo.parentEntity,_FLYING_OBJECTS[flyInfo.shapeID].color)

        if(sliceObject(entity)){

         

        console.log("SLICED A BOMB: " + flyInfo.isBomb)
        if(!flyInfo.isBomb){
          

          if(this.currentRecipe.isRequiredItem(flyInfo.shapeID)){
            
            if(this.comboActive){
              this.comboCount +=1
              let score = 500 + 100 * this.comboCount
              this.changeScoreBy(score) 
              spawnFloatingMessage(("COMBO x" + (this.comboCount+1)), Transform.get(entity).position, 0.4, this.objectPool.root, Color4.Green() )
              console.log("COMBO")
              this.comboTimer = 0
            }
            else{
              this.comboActive = true
              this.comboCount = 0
              let score = 300
              spawnFloatingMessage(("+ " + score), Transform.get(entity).position, 0.4, this.objectPool.root, Color4.Green() )
              this.changeScoreBy(score) 
            }

            this.currentRecipe.reduceItemCountByID(flyInfo.shapeID)
            this.recipeUI.applyRecipe(this.currentRecipe)
            
          }else{
            this.comboActive = false
            this.comboCount = 0
            let score = -50
            spawnFloatingMessage((score.toString()), Transform.get(entity).position, 0.4, this.objectPool.root, Color4.Red() )
            this.changeScoreBy(score) 
          }  

          if(this.currentRecipe.checkRecipe()){
            this.nextLevel()
          }
            
        }
        else{
          this.decreaseLives()
        }
                          
      }
      if(flyInfo.isBomb){
        this.soundBox.playMultiSound("sounds/explosion.mp3", true)     
      }
      else{
        this.soundBox.playMultiSound("sounds/chop.mp3", true)     
      }
      }
      
    }

    isRequiredItem(id:number):boolean{

     // console.log("CHECKING IF VEGGIE LOST: ID: " + id )
      if(this.currentRecipe.isRequiredItem(id)){
   //     console.log("REQUIRED VEGGIE LOST")
        return true
      }

      return false
    }

    decreaseLives(){
      const gameData = GameStateData.getMutable(gameStateEntity)
      gameData.lives--

      this.mainMenu.updateTries(gameData.lives)
      
     // console.log("DECREASED LIVES TO " +gameData.lives)

      if(gameData.lives <= 0){
        this.gameOver()
      }
    }

    changeScoreBy(score:number){
      const gameData = GameStateData.getMutable(gameStateEntity)

      if(gameData.state == GAME_STATE.MAIN_LOOP){
        gameData.score += score

      

        if(gameData.score < 0){
          gameData.score = 0
        }
        this.mainMenu.scoreCounter.setNumber( gameData.score)
      }
      
    }
   

    getState():GAME_STATE{
      return GameStateData.get(gameStateEntity).state
    }

    setState(state:GAME_STATE){
      GameStateData.getMutable(gameStateEntity).state = state
    }   

    getCurrentLevel():number{
      return GameStateData.get(gameStateEntity).currentLevel  
    }    
  
    private static copy(arr : Array<Array<number>>) : Array<Array<number>> {
      return JSON.parse(JSON.stringify(arr));
    }    

    nextLevel(){
      let state = GameStateData.getMutable(gameStateEntity)
      state.currentLevel += 1
      state.currentSpeed += 0.2

      if(state.currentLevel >= _LEVELS.length){
        state.currentLevel = 0
      }
      //this.mainMenu.levelButtons[state.currentLevel].enable()

      if(state.currentLevel < _LEVELS.length){
        this.currentRecipe = new Recipe(_LEVELS[state.currentLevel])
        this.recipeUI.applyRecipe(this.currentRecipe)
        this.recipeUI.slideIn()
        spawnFloatingMessage("SALAD COMPLETED!", Vector3.create(5.5,4.8,0), 0.4, this.objectPool.root, Color4.fromHexString("#ffaaffff"))
        this.soundBox.playSound("sounds/recipe_complete.mp3")
        
      }
      else{
        this.gameOver()
      }
     
    }

    startLevel(level:number){       
        
      //if (!miniGames.queue.isActive()) return
      
      const gameStateNonMutable = GameStateData.get(gameStateEntity)

      if(level < gameStateNonMutable.maxLevel){        
          
          const gameState = GameStateData.getMutable(gameStateEntity)
         // gameState.tries--
         
              //this.musicPlayer.playMusic()
              //this.grid.setLevel()
              gameState.currentLevel = level             
              gameState.elapsedTime = 0
              gameState.currentSpeed =  this._DEFAULT_SPEED
              gameState.currentLevel = level
              this.linesCleared = 0
              this._score = 0
              this.mainMenu.scoreCounter.setNumber(this._score)
             // this.mainMenu.resetLevelButtons()                    
              gameState.state = GAME_STATE.MAIN_LOOP   

         
      }
  }


  startCountDown(){
    this.mainMenu.countdown.show()
    this.soundBox.playSound("sounds/pre_countdown.mp3")
    let countDown = 4 
    this.mainMenu.countdown.setTimeAnimated(countDown--)
    let countDownTimer = utils.timers.setInterval(()=>{
      this.mainMenu.countdown.setTimeAnimated(countDown--)
    }, 1000)

    utils.timers.setTimeout(() => {     
      this.startLevel(0)     
      this.musicPlayer.playMusic()
      utils.timers.clearInterval(countDownTimer)
      this.mainMenu.countdown.hide()

      let gameState = GameStateData.getMutable(gameStateEntity)
      gameState.gameTime = 0
      gameState.lives = 3
      this.mainMenu.updateTries(gameState.lives)
      gameState.currentLevel = 0
      gameState.score = 0
      this.currentRecipe = new Recipe(_LEVELS[0])
      this.recipeUI.applyRecipe(this.currentRecipe)
      this.recipeUI.slideIn()
      this.mainMenu.scoreCounter.setNumber(0)
    }, 4000)
  }

  

  newGame(){   

    utils.timers.setTimeout(() => {
      // const mainCamera = MainCamera.createOrReplace(engine.CameraEntity, {
      //   virtualCameraEntity: this.customCamera,
      // })
      lockPlayer()      
      this.mainMenu.moveScoreToTop()
      this.startCountDown()
      this.mousePressed = false
      this.clickBlocker.disable()
    }, 1000)

      console.log("GETS THROUGH PLAYER CHECK")
    }

    gameOver(){
      this.setState(GAME_STATE.SHOW_SCORE)
      this.mainMenu.moveScoreToCenter()

      
    }    

    exitPlayer(){
     
      unlockPlayer()     
      this.mainMenu.moveScoreToTop()
      this.setState(GAME_STATE.IDLE)
      this.showScoreTime = 0
      VisibilityComponent.getMutable(this.cursor).visible = false
      this.objectPool.hideAll()
      this.clickBlocker.enable()
    }

    toggleSFX(){
      const gameState = GameStateData.getMutable(gameStateEntity)

      gameState.sfxOn = !gameState.sfxOn
      
  }

 
}