import { AvatarModifierArea, AvatarModifierType, CameraModeArea, CameraType, ColliderLayer, engine, Entity, GltfContainer, InputModifier, Material, MeshCollider, MeshRenderer, Transform } from "@dcl/sdk/ecs";
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math";
import { movePlayerTo } from "~system/RestrictedActions";
//import { sceneParentEntity, utilities } from "@dcl-sdk/mini-games/src";
import { realDistance } from "./modules/utilities";
import { getPlayer } from "@dcl/sdk/players";
import { sceneParentEntity } from "./globals";
import * as utilities from "./utilities"

let lockCollider: Entity
let lockPos = Vector3.create(8, 2.8, 11)
let boardPos = Vector3.create(8, 2.0, 4)
let playPos = Vector3.create(8, 2.8, 11)
let spectatorPos = Vector3.create(8, 0, 15)

let hideArea:Entity

export function addHideArea() {
    if(!hideArea) hideArea = engine.addEntity()
        Transform.createOrReplace(hideArea, {
            position: Vector3.create(8,14,6)
        })
        let userData = getPlayer()
        if(userData){
            AvatarModifierArea.createOrReplace(hideArea, {
                area: Vector3.create(10, 5, 10),
                modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
                excludeIds: [userData.userId]})
            
        }
}

export function lockPlayer(){
    let sceneTransform = Transform.get(sceneParentEntity)
    let sceneRotation = sceneTransform.rotation
    let sceneCenter = sceneTransform.position
   

     lockPos = utilities.rotateVectorAroundCenter(playPos, sceneCenter, sceneRotation)
     boardPos = utilities.rotateVectorAroundCenter(boardPos, sceneCenter, sceneRotation)
    
    if(!lockCollider) lockCollider = engine.addEntity()
    Transform.createOrReplace(lockCollider, {
        position: Vector3.add(lockPos, Vector3.create(0, 0, 0)),
        scale: Vector3.create(0.72, 1.75, 0.72)
    })
    GltfContainer.createOrReplace(lockCollider, {src: 'models/lock_collider.glb', invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS})
    
    CameraModeArea.createOrReplace(lockCollider, {
        area: Vector3.create(3, 3, 3),
        mode: CameraType.CT_FIRST_PERSON,
    })

    movePlayerTo({
        newRelativePosition: lockPos,
        cameraTarget: Vector3.add(boardPos, Vector3.create(0, 0.1, 0)),
    })
    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
            $case: 'standard',
            standard: {
                disableAll: true,
            },
        },
    })
    if(hideArea){
        Transform.getMutable(hideArea).position.y = 1
    }
    // if(!hideArea) hideArea = engine.addEntity()
    // Transform.createOrReplace(hideArea, {
    //     position: Vector3.create(8,1,6)
    // })
    // let userData = getPlayer()
    // if(userData){
    //     AvatarModifierArea.createOrReplace(hideArea, {
    //         area: Vector3.create(10, 5, 10),
    //         modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
    //         excludeIds: [userData.userId]})
        
    // }

    engine.addSystem(LockSystem)
}

export function unlockPlayer(){
    let sceneTransform = Transform.get(sceneParentEntity)
    let sceneRotation = sceneTransform.rotation
    let sceneCenter = sceneTransform.position

    engine.removeSystem(LockSystem)

    if(!lockCollider) lockCollider = engine.addEntity()
    Transform.createOrReplace(lockCollider, {
        position: Vector3.create(8, -2, 8), 
        scale: Vector3.create(0.72, 1.75, 0.72)
    })
    
    let unlockPos = utilities.rotateVectorAroundCenter(spectatorPos, sceneCenter, sceneRotation)
    movePlayerTo({
        newRelativePosition: unlockPos,
        cameraTarget: Vector3.add(Vector3.add(sceneCenter, Vector3.create(0, 1, 0)), Vector3.create(0, 0.5, 0)),
    })
    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
            $case: 'standard',
            standard: {
                disableAll: false,
            },
        },
    })
    if(hideArea){
        Transform.getMutable(hideArea).position.y = 14
    }


}
// export function unlockPlayer(){
//     let sceneTransform = Transform.get(sceneParentEntity)
//     let sceneRotation = sceneTransform.rotation
//     let sceneCenter = sceneTransform.position

//     console.log("CICA")
//     engine.removeSystem(LockSystem)
//     console.log("KUTYA")
//     if(!lockCollider) lockCollider = engine.addEntity()
//     Transform.createOrReplace(lockCollider, {
//         position: Vector3.create(8, -2, 8),
//         scale: Vector3.create(0.72, 1.75, 0.72)
//     })
    
//     console.log("MERESI")
//     let unlockPos = utilities.rotateVectorAroundCenter(spectatorPos, sceneCenter, sceneRotation)
//     console.log("HIBA")
//     movePlayerTo({
//         newRelativePosition: unlockPos,
//         cameraTarget: Vector3.add(Vector3.add(sceneCenter, Vector3.create(0, 1, 0)), Vector3.create(0, 0.5, 0)),
//     })
//     InputModifier.createOrReplace(engine.PlayerEntity, {
//         mode: {
//             $case: 'standard',
//             standard: {
//                 disableAll: false,
//             },
//         },
//     })

//     if(hideArea){
//         Transform.getMutable(hideArea).position.y = 14
//     }
// }

let checkInterval = 0.5 + Math.random()
let intervalCount = 0
let consecutiveCount = 0

export function LockSystem(dt: number){
    intervalCount += dt

    if(intervalCount < checkInterval) return
    intervalCount = 0
    checkInterval = 0.5 + Math.random()

    let playerPos = Transform.getMutable(engine.PlayerEntity).position
    console.log('check pos:', playerPos.x, playerPos.z, 'lock pos:', lockPos.x, lockPos.z)

    // if(Math.round(playerPos.x) !== Math.round(lockPos.x) || Math.round(playerPos.z) !== Math.round(lockPos.z)){
    //     movePlayerTo({
    //         newRelativePosition: lockPos,
    //         cameraTarget: Vector3.add(boardPos, Vector3.create(0, 0.5, 0)),
    //     })
    //     consecutiveCount = 0
    // }
    if(realDistance(playerPos, lockPos) >= 1 ){
        movePlayerTo({
            newRelativePosition: lockPos,
            cameraTarget: Vector3.add(boardPos, Vector3.create(0, 0.5, 0)),
        })
        consecutiveCount = 0
    }
    else{
        consecutiveCount += 1
        if(consecutiveCount === 5){
            engine.removeSystem(LockSystem)
        }
    }

}