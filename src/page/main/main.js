import React, { useEffect, useRef, useState } from "react";
import characterImages from "../../component/user/CharacterArray";
import background from "../../characterimages/bkgnd.png"

const MAP_CONSTANTS = {};
MAP_CONSTANTS.IMG_WIDTH = 116;
MAP_CONSTANTS.IMG_HEIGHT = 125;
MAP_CONSTANTS.KEY_LEFT = 37;
MAP_CONSTANTS.KEY_DOWN = 38;
MAP_CONSTANTS.KEY_RIGHT = 39;
MAP_CONSTANTS.KEY_UP = 40;
MAP_CONSTANTS.SPEED = 8;
MAP_CONSTANTS.FRAMES_LENGTH = 8;

const Main = () => {
    const users = [
        {id: 123, name: "jaemin", characterType: "man1"},
        {id: 123, name: "jaemin", characterType: "man1"},
        {id: 123, name: "jaemin", characterType: "man1"},
        {id: 123, name: "jaemin", characterType: "woman1"}
    ]
  const canvasRef = useRef(null);
  const requestAnimationRef = useRef(null);
  const positionRef = useRef([]);
  const [pressedKey, setPressedKey] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  const move = ({ x, y, dir }) => {
    const newX = positionRef.current[0].x + x;
    const newY = positionRef.current[0].y + y;
    if (newX < 0 || newX > canvasRef.current.width - MAP_CONSTANTS.IMG_WIDTH)
      return;
    if (newY < 0 || newY > canvasRef.current.height - MAP_CONSTANTS.IMG_HEIGHT)
      return;
    positionRef.current[0] = { x: newX, y: newY };
    setCurrentFrame(dir);
  };
  users.forEach((item) => {
    positionRef.current.push({x:0, y:0});
  })
  const render = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let characters = [];
    users.forEach((item) =>{
        characters.push(new Image());
    });
    characters.forEach((character, index) =>{
        if(users[index].characterType === "woman1"){
            character.src = characterImages.woman1[currentFrame];
        }
        else if(users[index].characterType === "man1"){
            character.src = characterImages.man1[currentFrame];
        }
        character.onload = () => {
            if(index === 0){
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            context.drawImage(
              character,
              positionRef.current[index].x,
              positionRef.current[index].y
            );
        };
    })

    handleKey();
    requestAnimationRef.current = requestAnimationFrame(render);
  };

  const handleKey = () => {
    switch (pressedKey) {
      case MAP_CONSTANTS.KEY_LEFT:
        move({ x: -1 * MAP_CONSTANTS.SPEED, y: 0, dir: 1 });
        return;
      case MAP_CONSTANTS.KEY_DOWN:
        move({ x: 0, y: -1 * MAP_CONSTANTS.SPEED, dir: 3 });
        return;
      case MAP_CONSTANTS.KEY_RIGHT:
        move({ x: MAP_CONSTANTS.SPEED, y: 0, dir: 2 });
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
            backgroundImage: `url(${background})`,
            backgroundSize: "cover",
            overflow: "hidden",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
      }}
    ></canvas>
  );
};

export default Main;