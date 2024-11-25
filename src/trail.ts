import { engine, Entity, Material, MaterialTransparencyMode, MeshRenderer, Schemas, Transform } from "@dcl/sdk/ecs"
import { Color3, Color4, Vector3 } from "@dcl/sdk/math"
import { moveLineBetween } from "./modules/utilities"



export const TrailObject = engine.defineComponent('trail-id', {
    fadeFactor: Schemas.Number
})

export const HasTrail = engine.defineComponent('hastrail-id', {
    lastPos: Schemas.Vector3,
    saveTimer: Schemas.Number,
    saveFreq: Schemas.Number
})

export class Trail {
    trails: Entity[]    
    trailCount: number

    constructor(parentEntity:Entity){

        this.trailCount = 8
        this.trails = []
        // create pool of trail lines
    for (let i = 0; i < this.trailCount; i++) {
        let trailLine = engine.addEntity()
        Transform.create(trailLine, { 
            scale: Vector3.create(0, 0, 0), 
        //    parent: parentEntity 
        })
        MeshRenderer.setPlane(trailLine)
  
        Material.setPbrMaterial(trailLine, {
          albedoColor: Color4.fromHexString("#FFFFFF44"),
          transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
          emissiveColor: Color4.fromHexString("#FFFFFF44")  
        })
        TrailObject.create(trailLine, { fadeFactor: 0 })
  
        this.trails.push(trailLine)

        //multiPlayer && syncEntity (trailLine, [Transform.componentId], 100011+ i)
      }


      engine.addSystem((dt:number)=>{
        const trailObjectGrp = engine.getEntitiesWith(HasTrail, Transform) 

        for (const [obj] of trailObjectGrp){

            const transform = Transform.getMutable(obj)
            let trailInfo = HasTrail.getMutable(obj)



            trailInfo.saveTimer += dt

            if (trailInfo.saveTimer > trailInfo.saveFreq) {
            trailInfo.saveTimer = 0


            let trailLine = this.trails.shift()
            //const trailTransform = Transform.getMutable(trailLine)        
            //trailTransform.position = Vector3.create( transformBall.position.x,  transformBall.position.y,  transformBall.position.z)
            //trailTransform.scale = Vector3.create(0.35,0.35,0.35),
            if(trailLine){
                let fadeFactor = 0
                Material.setPbrMaterial(trailLine, {
                    albedoColor: Color4.fromInts(180, 180 * (1 - fadeFactor) * 2, 255 * (1 - fadeFactor) * 0.1, 255* (1 - fadeFactor)),
                    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
                    emissiveColor: Color3.fromInts(255, 255 * (1 - fadeFactor) * 2, 255 * (1 - fadeFactor) * 0.3),
                    //emissiveColor: Color3.fromInts(255,255 *0.8, 255 * 0.1),
                    emissiveIntensity: 2
                })
                moveLineBetween(trailLine, transform.position, trailInfo.lastPos)
                Vector3.copyFrom(transform.position, trailInfo.lastPos)

                const trailTransform = Transform.getMutable(trailLine)
                trailTransform.scale.x = 0.2
                trailTransform.scale.z = 0.2





                this.trails.push(trailLine)
            }
            
            

            
            }
        }
        })

    }

    
}

export function trailUpdate(dt:number){    

    const trailGroup = engine.getEntitiesWith(TrailObject, Transform) 

    for (const [trail] of trailGroup){
   
        const trailTransform = Transform.getMutable(trail)
        const trailInfo = TrailObject.getMutable(trail)
  
        trailTransform.scale.x -= dt * 0.5
        trailTransform.scale.z -= dt * 0.2
        // trailTransform.scale.z -= dt * 0.4
        trailInfo.fadeFactor += 3*dt
        if (trailInfo.fadeFactor > 1) trailInfo.fadeFactor = 1
        if (trailTransform.scale.x < 0) trailTransform.scale.x = 0
        if (trailTransform.scale.z < 0) trailTransform.scale.z = 0
  
        // Material.setPbrMaterial(trail, {
        //   albedoColor: Color4.fromInts(255, 255 * (1 - trailInfo.fadeFactor) * 2, 255 * (1 - trailInfo.fadeFactor) * 0.1, 255 * (1 - trailInfo.fadeFactor) * 0.5),
        //   transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
        //   emissiveColor: Color3.fromInts(255, 255 * (1 - trailInfo.fadeFactor) * 2, 255 * (1 - trailInfo.fadeFactor) * 0.4),
        //   //emissiveColor: Color3.fromInts(255,255 *0.8, 255 * 0.4),
        //   emissiveIntensity: 2
  
  
        // })
    }
}