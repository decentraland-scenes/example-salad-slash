import { ColliderLayer, engine, Entity, EntityMappingMode, GltfContainer, InputAction, inputSystem, Material, MaterialTransparencyMode, PointerEventType, Transform, TransformTypeWithOptionals, VisibilityComponent } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { Vector2 } from "~system/EngineApi";
import { createFlyingObject, FlyingObject, sliceObject } from "./vegetables";
import { parentEntity, syncEntity } from "@dcl/sdk/network";
import { _FLYING_OBJECTS, GRAVITY, SHOOT_FORCE } from "./globals";
import { SoundBox } from "./soundbox";




export class FlyingObjectPool { 
    root:Entity
    vegetablePool:Entity[]
    maxVeggieCount:number = 10
    currentPoolIndex:number = 0
    soundBox:SoundBox    

    constructor(transform:TransformTypeWithOptionals, _parent:Entity){

        this.root = engine.addEntity()
        Transform.create(this.root, transform)

        this.vegetablePool = []

        this.initVegetablePool()
        this.soundBox = new SoundBox() 

       

    }

    initVegetablePool(){

        let dummyAllVeggieIcon = engine.addEntity()
        Transform.create(dummyAllVeggieIcon, {
            position: Vector3.create(8,-4,8)
        })
        GltfContainer.create(dummyAllVeggieIcon, {
            src: "models/vegetables/all_veggies.glb"
        })

        let dummyEyplosion = engine.addEntity()
        Transform.create(dummyEyplosion, {
            position: Vector3.create(8,-4,8),
            scale: Vector3.create(0.1, 0.1, 0.1)
        })
        GltfContainer.create(dummyEyplosion, {
            src: "models/explosion.glb"
        })

        let index = 0
        for( let i=0; i< this.maxVeggieCount; i++){
            let vegetable = createFlyingObject({
                position: Vector3.create(1+i*1,-4,4)
            }, 
                this.root, 
                false)

            //preloading all glb types underground
            index = i%_FLYING_OBJECTS.length
            GltfContainer.createOrReplace(vegetable, {
                src: this.getShape(index)                
            })
            //
            this.vegetablePool.push(vegetable)
        }
    }

    getRandomShapeID():number{       

        let id = Math.floor(Math.random() * _FLYING_OBJECTS.length)
        if (id == _FLYING_OBJECTS.length){
            id = _FLYING_OBJECTS.length-1
        }
        return id
    }
    getShape(id:number):string{
        return _FLYING_OBJECTS[id].shape
    }

    hideAll(){
        for( let i=0; i< this.vegetablePool.length; i++){            
            VisibilityComponent.getMutable(this.vegetablePool[i]).visible = false
        }

        const flyingGroup = engine.getEntitiesWith(FlyingObject, VisibilityComponent) 

        for (const [obj] of flyingGroup){

            VisibilityComponent.getMutable(obj).visible = false
        }
    }

    spawnVegetable(rangeX:number){

        let spawnX = 2 + Math.random()*rangeX
        let leanBias = (spawnX > rangeX/2)?Math.random() *-5 : Math.random() * 5

        let emitterPosition = Vector3.create(spawnX,0,1.5)  
        let shootDirection = Vector3.create(leanBias, SHOOT_FORCE * (0.6 +Math.random()* 0.5), 0)
        this.currentPoolIndex ++
        if(this.currentPoolIndex >= this.maxVeggieCount){
            this.currentPoolIndex = 0            
        }

        let obj = this.vegetablePool[this.currentPoolIndex]

       
        let id = this.getRandomShapeID()
        let transform = Transform.getMutable(obj)
        let flyInfo = FlyingObject.getMutable(obj)
        VisibilityComponent.getMutable(obj).visible = true        
       

        GltfContainer.createOrReplace(obj, {
            src: this.getShape(id),
            invisibleMeshesCollisionMask: ColliderLayer.CL_POINTER
        })
        
        Vector3.copyFrom(emitterPosition, transform.position)
        transform.rotation = Quaternion.fromEulerDegrees(Math.random()*360, 0, Math.random()*360)
        transform.scale = Vector3.One()
       
        flyInfo.shapeID = id
        flyInfo.active = true
        Vector3.copyFrom(shootDirection, flyInfo.dir)
        flyInfo.splitable = true     
        flyInfo.scored = false
        flyInfo.rotationSpeed = 1 + Math.random()* 5

        //BOMB
        if(id == 0){
            flyInfo.isBomb = true
        }
        else{
            flyInfo.isBomb = false
        }
       // this.soundBox.playMultiSound("sounds/swosh.mp3", true)

    }
}