import { ColliderLayer, engine, Entity, GltfContainer, Material, MeshCollider, MeshRenderer, Transform } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { Quaternion } from "@dcl/sdk/math"

export function addEnvironment(parent:Entity)
{
    let environment = engine.addEntity()
    Transform.create(environment, {
        position: Vector3.create(0, 0, 0),
        rotation: Quaternion.fromEulerDegrees(0, 90, 0),
        parent:parent
    })
    GltfContainer.create(environment, {
        src:'models/environment.glb' , 
        invisibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM1 | ColliderLayer.CL_PHYSICS 
    })

    


// let gameAreaCollider = engine.addEntity()
//     Transform.create(gameAreaCollider, {
//         parent: parent,
//         scale:Vector3.create(16,9,12), 
//         position: Vector3.create(0, 4.5,-2)  
//     })
//     //MeshRenderer.setBox(gameAreaCollider)
//     MeshCollider.setBox(gameAreaCollider)

}