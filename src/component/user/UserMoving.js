import React, { useEffect, useRef, useState } from "react";
import users from "../user/CharacterArray";

const MAP_CONSTANTS = {};
MAP_CONSTANTS.IMG_WIDTH = 116;
MAP_CONSTANTS.IMG_HEIGHT = 125;
MAP_CONSTANTS.KEY_LEFT = 37;
MAP_CONSTANTS.KEY_DOWN = 38;
MAP_CONSTANTS.KEY_RIGHT = 39;
MAP_CONSTANTS.KEY_UP = 40;
MAP_CONSTANTS.SPEED = 8;
MAP_CONSTANTS.FRAMES_LENGTH = 8;

const UserMoving = (characterType) => {
  const canvasRef = useRef(null);
  const requestAnimationRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const [pressedKey, setPressedKey] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [timer, setTimer] = useState(0);

  const move = ({ x, y, dir }) => {
    const newX = positionRef.current.x + x;
    const newY = positionRef.current.y + y;
    if (newX < 0 || newX > canvasRef.current.width - MAP_CONSTANTS.IMG_WIDTH)
      return;
    if (newY < 0 || newY > canvasRef.current.height - MAP_CONSTANTS.IMG_HEIGHT)
      return;
    positionRef.current = { x: newX, y: newY };
    
    if(0 <= timer % 10 && timer % 10 <= 4){
      setCurrentFrame(dir);
    } else {
      setCurrentFrame(dir + 1);
    }
  };

  const render = () => {
    setTimer((prev) => prev + 1);
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const character = new Image();
    if(characterType === "woman1"){
      character.src = users.woman1[currentFrame];
    }
    else if(characterType === "man1"){
      character.src = users.man1[currentFrame];
    }
    character.onload = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      context.drawImage(
        character,
        positionRef.current.x,
        positionRef.current.y
      );
    };
    handleKey();
    requestAnimationRef.current = requestAnimationFrame(render);
  };

  const handleKey = () => {
    switch (pressedKey) {
      case MAP_CONSTANTS.KEY_LEFT:
        move({ x: -1 * MAP_CONSTANTS.SPEED, y: 0, dir: 2 });
        return;
      case MAP_CONSTANTS.KEY_DOWN:
        move({ x: 0, y: -1 * MAP_CONSTANTS.SPEED, dir: 6 });
        return;
      case MAP_CONSTANTS.KEY_RIGHT:
        move({ x: MAP_CONSTANTS.SPEED, y: 0, dir: 4 });
        return;
      case MAP_CONSTANTS.KEY_UP:
        move({ x: 0, y: MAP_CONSTANTS.SPEED, dir: 0 });
        return;
      case null:
        return;
      default:
        move({ x: 0, y: 0 });
        return;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      e.preventDefault();
      setPressedKey(e.keyCode);
    });
    window.addEventListener("keyup", () => setPressedKey(null));
    requestAnimationRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(requestAnimationRef.current);
    };
  });
  return (
    <canvas
      ref={canvasRef}
      style={{
            //backgroundImage: `url(${background})`,
            backgroundSize: "cover",
            overflow: "hidden",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
      }}
    ></canvas>
  );
};

export default UserMoving;