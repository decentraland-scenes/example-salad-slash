import { Entity, Transform } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";

export function pitchShift(currentPitch:number, shift:number):number{
    return  (Math.pow( 2.0, (shift / 12.0 )) * currentPitch)
}

export function shuffle(array: number[]): number[] {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
};
export function realDistance(pos1: Vector3, pos2: Vector3): number 
{
    const a = pos1.x - pos2.x
    const b = pos1.y - pos2.y
    const c = pos1.z - pos2.z
    return Math.sqrt(a * a + b * b + c * c)
}

export function moveLineBetween(line:Entity, A:Vector3, B:Vector3){
  
    let dist = realDistance(A,B)
    let rotAngle =  Quaternion.fromToRotation(Vector3.Up(), Vector3.subtract(A,B)) 

   const transform = Transform.getMutable(line)

   transform.position = Vector3.lerp(A,B,0.5)
//    transform.position.y += 0.02
   transform.scale =  Vector3.create(0.05,dist,0.05)
   transform.rotation = rotAngle
   //transform.rotation *= Quaternion. (Vector3.Right(),90)        
}