import { AudioSource, engine, Entity, GltfContainer, InputAction, MeshCollider, PointerEvents, pointerEventsSystem, PointerEventType, Schemas, Transform, TransformTypeWithOptionals, VisibilityComponent } from "@dcl/sdk/ecs";
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math";
import { parentEntity, syncEntity } from "@dcl/sdk/network";
import { _FLYING_OBJECTS, BOARD_DECAL_PLANE_OFFSET, SCENE_CENTER } from "./globals";
//import { spawnSplat } from "./splat";
import * as utils from "@dcl-sdk/utils"


export const FlyingObject = engine.defineComponent('flying-object', { 
    shapeID:Schemas.Number,
    active:Schemas.Boolean,
    rotationSpeed:Schemas.Number,
    splitable:Schemas.Boolean,          
    dir:Schemas.Vector3,   
    parentEntity:Schemas.Entity,
    disposable:Schemas.Boolean,
    scored:Schemas.Boolean,
    isBomb:Schemas.Boolean
})

export const Explosion = engine.defineComponent('explosion', { 
    parentEntity:Schemas.Entity,
    disposable:Schemas.Boolean,
    duration:Schemas.Number,
    timer:Schemas.Number
   
})

export function spawnExplosion(pos:Vector3, parent:Entity){

  let explosion = engine.addEntity()
  Transform.create(explosion,{
    parent: parent,
    position: Vector3.create(pos.x, pos.y, pos.z),
    rotation: Quaternion.fromEulerDegrees(0,90,0),
    scale: Vector3.create(0.75,0.75,0.75)
  })
  GltfContainer.create(explosion, {src: "models/explosion.glb"})
  Explosion.create(explosion, {
    duration: 0.9,
    timer:0
  })
  

  

}

export function createFlyingObject(transform:TransformTypeWithOptionals, parent:Entity, isBomb:boolean ):Entity{

    let object = engine.addEntity()
    Transform.create(object, transform)
    FlyingObject.createOrReplace(object,{
        shapeID:0,
        active:false,
        splitable:true,
        dir:Vector3.Up(), 
        parentEntity:parent,
        disposable:false,
        scored:false,
        isBomb: isBomb,
        rotationSpeed: 0.5+Math.random()*0.5

    })
   // MeshCollider.setSphere(vegetable)
    VisibilityComponent.createOrReplace(object)
   

    PointerEvents.create(object, { pointerEvents: [
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          button: InputAction.IA_POINTER,
          showFeedback: true,
          hoverText: "Slice",
          maxDistance: 18
        }
      },
      {
        eventType: PointerEventType.PET_HOVER_ENTER,
        eventInfo: {
          button: InputAction.IA_POINTER,
          showFeedback: false,          
          maxDistance: 18
        }
      },
    ]})

 

    return object

}

export function sliceObject(object:Entity):boolean{

  let flyInfoStatic = FlyingObject.get(object)
  if(flyInfoStatic.splitable){

    VisibilityComponent.getMutable(object).visible = false

    let originalTransform = Transform.getMutable(object)    
    let flyInfo = FlyingObject.getMutable(object)

    flyInfo.splitable = false
    let bombMultiplier = 1
    if(flyInfo.isBomb){
      bombMultiplier = 10
    }

    for(let i=0; i< _FLYING_OBJECTS[flyInfo.shapeID].subShapes.length; i++){
      let part = engine.addEntity()
      Transform.create(part, {
        parent: flyInfo.parentEntity,
        position: Vector3.create(originalTransform.position.x, originalTransform.position.y, originalTransform.position.z ),
        rotation: Quaternion.create(originalTransform.rotation.x, originalTransform.rotation.y, originalTransform.rotation.z, originalTransform.rotation.w)
      })
      
  
      //console.log("sliced top half at: " + Transform.get(part).position.x + ", " + Transform.get(part).position.y)
      
      GltfContainer.createOrReplace(part, {src: _FLYING_OBJECTS[flyInfo.shapeID].subShapes[i]})
      FlyingObject.createOrReplace(part,{
        shapeID:flyInfo.shapeID,
        active:true,
        splitable:false,
       // dir:Vector3.rotate(Vector3.scale(Vector3.Up(),3 + Math.random()), Quaternion.fromEulerDegrees(25,0, Math.random()*45)),    
        dir:Vector3.rotate(Vector3.scale(Vector3.Up(),3 + Math.random() * bombMultiplier), Quaternion.multiply(originalTransform.rotation, Quaternion.fromEulerDegrees(180 * i + Math.random()*45, 0,-Math.random()*10)) ),    
        disposable:true,
        rotationSpeed: 0.5+Math.random()*4    
        //dir:Vector3.Zero()        
    })
    VisibilityComponent.createOrReplace(part, {visible : true})
   
    }    


    let splatPos = Vector3.create(originalTransform.position.x, originalTransform.position.y, BOARD_DECAL_PLANE_OFFSET)
   // spawnSplat(splatPos, flyInfo.parentEntity,_FLYING_OBJECTS[flyInfo.shapeID].color)
    //spawnSplash(originalTransform.position, originalTransform.rotation, flyInfo.parentEntity, Color4.White())

    if(flyInfoStatic.isBomb){

      //VisibilityComponent.getMutable(vegetable).visible = false
      spawnExplosion(Transform.get(object).position, flyInfoStatic.parentEntity )

    }

    if(!flyInfo.scored){
      flyInfo.scored = true
      return true
    }  

    }

  return false

}

export function explosionSystem(dt:number){
  const explosionGroup = engine.getEntitiesWith(Explosion, Transform) 

        for (const [obj] of explosionGroup){

          let expInfo = Explosion.getMutable(obj)
          expInfo.timer +=dt
          if( expInfo.timer >= expInfo.duration){

            engine.removeEntity(obj)

          }
        }
}