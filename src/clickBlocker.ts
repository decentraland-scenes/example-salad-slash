import { engine, Entity, GltfContainer, MeshCollider, MeshRenderer, Transform } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"

export class ClickBlocker {
    blockerEntity:Entity
    playAreaCollider:Entity

    constructor(parent:Entity){
        this.blockerEntity = engine.addEntity()
        Transform.create( this.blockerEntity, {
            parent: parent,
            scale:Vector3.create(15,12,3), 
            position: Vector3.create(0, 6 ,-6.5)  
        })
        //MeshRenderer.setBox(this.blockerEntity)
        MeshCollider.setBox( this.blockerEntity)

        this.playAreaCollider = engine.addEntity()
        Transform.create(this.playAreaCollider, {
            parent: parent
        })
        GltfContainer.createOrReplace(this.playAreaCollider, {
            src: "models/play_area_collider.glb"
        })
    }

    enable(){
        if(!MeshCollider.has(this.blockerEntity)){
            MeshCollider.setBox( this.blockerEntity)
        }
    }
    disable(){
        MeshCollider.deleteFrom(this.blockerEntity)
        
       
    }
}