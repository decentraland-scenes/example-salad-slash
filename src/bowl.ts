import { ColliderLayer, engine, Entity, GltfContainer, Material, MeshRenderer, Transform } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { Quaternion } from "@dcl/sdk/math"


export class Bowl {
    bowl:Entity

    constructor(){
        this.bowl = engine.addEntity()
    }
}
// export function addEnvironment()
// {
//     let environment = engine.addEntity()
// Transform.create(environment, {
//     position: Vector3.create(8, 0, 8),
//     rotation: Quaternion.fromEulerDegrees(0, -90, 0)
// })
// GltfContainer.create(environment, {
//     src:'models/environment.glb' , 
//     invisibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM1 | ColliderLayer.CL_PHYSICS 
// })

// }