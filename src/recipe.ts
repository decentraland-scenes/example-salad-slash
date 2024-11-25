import { EasingFunction, engine, Entity, GltfContainer, Transform, TransformTypeWithOptionals, Tween, tweenSystem, VisibilityComponent } from "@dcl/sdk/ecs"
import { _FLYING_OBJECTS, getRandomShapeID } from "./globals"
import { shuffle } from "./modules/utilities"

import { Quaternion, Vector3 } from "@dcl/sdk/math"
import * as utils from "@dcl-sdk/utils"
import { LevelData } from "./levelData"


import { tweenUtils } from "./tweenSystem"
import { EasingType } from "./easingFunctions"
import * as ui from "./ui"

export class RequiredItem {
    id:number
    count:number

    constructor(id:number, count:number){
        this.id = id
        this.count = count
    }
}

export class Recipe {
    requiredItems:RequiredItem[] = []
    acceptAll:boolean = false

    constructor(levelData:LevelData){
       // console.log("REQUIRED: ")
        let itemRandomArray = []
        for (let i=1; i < _FLYING_OBJECTS.length; i++){
            itemRandomArray.push(i)
        }
        itemRandomArray = shuffle(itemRandomArray)
        //console.log("RAND ARRAY: " + itemRandomArray)


        this.acceptAll = levelData.acceptAll

        for (let i=0; i< levelData.countList.length; i++){ 

            if(i < itemRandomArray.length){
                this.addRequiredItem(itemRandomArray[i], levelData.countList[i])

               // console.log(_FLYING_OBJECTS[this.requiredItems[i].id].name + " : ID: " + this.requiredItems[i].id + " , COUNT: " + this.requiredItems[i].count ) 
            }
            
        }

    }

    addRequiredItem(id:number, count:number){
        let item = new RequiredItem(id, count) 
        this.requiredItems.push(item)
    }

    reduceItemCountByID(id:number){

        if(!this.acceptAll){
            for(let item of this.requiredItems){

                if(item.id == id){
                    item.count--
                    //console.log("COLLECTED ONE: " + _FLYING_OBJECTS[item.id].name + " , " + item.count + " remains" )
                    if(item.count <= 0){
                        item.count = 0
                     //   console.log("COLLECTED ALL OF THIS: " + _FLYING_OBJECTS[item.id].name )
                        // if(this.checkRecipe()){
                        //     console.log("RECIPE COMPLETED")
                        // }
                    }    
                }
                
            }
        }
        else{
            for(let item of this.requiredItems){

               // if(item.id == id){
                    item.count--
                    console.log("COLLECTED ONE: " + _FLYING_OBJECTS[item.id].name + " , " + item.count + " remains" )
                    if(item.count <= 0){
                        item.count = 0
                        console.log("COLLECTED ALL OF THIS: " + _FLYING_OBJECTS[item.id].name )
                        // if(this.checkRecipe()){
                        //     console.log("RECIPE COMPLETED")
                        // }
                    }    
               // }
                
            }
        }

        
    }

    checkRecipe():boolean{

        for(let item of this.requiredItems){
            if(item.count >0){
                return false
            }
        }

        return true
    }

    isRequiredItem(id:number):boolean{       

        if(!this.acceptAll){
            for(let item of this.requiredItems){

                if(item.id == id && item.count > 0){
                    return true
                }
            }
            return false
        }
        else{
            return true
        }
        
    }




}

export class RecipeDisplay {    
    root:Entity
    icon:Entity
    background:Entity
    counter:ui.Counter3D

    constructor(transform:TransformTypeWithOptionals, id:number){
        this.root = engine.addEntity()
        Transform.create(this.root, transform)

        this.icon = engine.addEntity()
        Transform.create(this.icon, {
            parent: this.root,
            rotation: Quaternion.fromEulerDegrees(-60,-10,30),
            scale: Vector3.create(0.55, 0.55, 0.55)
        })
        GltfContainer.create(this.icon, {src: _FLYING_OBJECTS[1].shape })
        VisibilityComponent.create(this.icon)

        this.counter = new ui.Counter3D(
            {
                position:Vector3.create(0,-0.75,0),
                rotation:Quaternion.fromEulerDegrees(0,180,0),
                scale:Vector3.create(0.28, 0.28, 0.28),
                parent: this.root
            },
            2,
            1.1,
            false,
            id,
            'center'
        )
        this.counter.show()
        this.counter.setNumber(0)

        this.background = engine.addEntity()
        Transform.create(this.background,
            {
                position: Vector3.create(0,0,0.1),
                parent:this.root
            }
        )
        GltfContainer.create(this.background, { src: "models/recipe_bg.glb"})
        VisibilityComponent.create(this.background)
       
    }

    setDisplay(shapeURL:string, count:number){
        GltfContainer.createOrReplace(this.icon, {src: shapeURL })
        this.counter.setNumber(count)
    }

    hide(){
        this.counter.hide()
        VisibilityComponent.getMutable(this.icon).visible = false
        VisibilityComponent.getMutable(this.background).visible = false
    }

    show(){
        this.counter.show()
        VisibilityComponent.getMutable(this.icon).visible = true
        VisibilityComponent.getMutable(this.background).visible = true
    }

}

export class RecipeUI {
    root:Entity
    maxItems:number = 4
    recipeDisplays:RecipeDisplay[]
    displaySpacing:number = 1.0

    constructor(parent:Entity){

        this.recipeDisplays = []

        this.root= engine.addEntity()
        Transform.createOrReplace(this.root,{parent: parent})
        for (let i=0; i< this.maxItems; i++){
            let display = new RecipeDisplay({
                    position:Vector3.create(this.displaySpacing * i, 0, -1),
                    parent:this.root
                },
                90000+i
            )

            this.recipeDisplays.push(display)

        }
    }

    applyRecipe(recipe:Recipe){

        for(let i=0; i< recipe.requiredItems.length; i++){

            if(i < this.maxItems){
                this.recipeDisplays[i].show()
                if(!recipe.acceptAll){
                    this.recipeDisplays[i].setDisplay(_FLYING_OBJECTS[recipe.requiredItems[i].id].shape , recipe.requiredItems[i].count)
                }
                else{
                    this.recipeDisplays[i].setDisplay("models/vegetables/all_veggies.glb", recipe.requiredItems[i].count)
                }
                
            }
        }

        for(let i=0; i< this.recipeDisplays.length; i++){

            if(i >= recipe.requiredItems.length){
                this.recipeDisplays[i].hide()
            }
        }
    }

    

    slideIn(){

       // let currentTransform = Transform.get(this.root)
       
       
       tweenUtils.startTranslation(
        this.root,
        Vector3.create( +10, 0,0 ),
        Vector3.create( 0, 0,0 ),
        1,
        EasingType.EASEOUTEBOUNCE
       )
    //    utils.tweens.startTranslation(
    //     this.root,
    //     Vector3.create( +10, 0,0 ),
    //     Vector3.create( 0,0,0),
    //     1,
    //     utils.InterpolationType.EASEOUTEBOUNCE
    //    )
        // Tween.createOrReplace(this.root, {
        //     duration:1000,
        //     easingFunction: EasingFunction.EF_EASEOUTBOUNCE,
        //     mode: Tween.Mode.Move({
        //         start: Vector3.create( +10, 0,0 ),
        //         end: Vector3.create( 0,0,0)
        //     }),
        //     playing:true
        //     })
    }
}