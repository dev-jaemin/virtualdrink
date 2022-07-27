import React, { useEffect, useRef, useState } from "react";
import characterImages from "../user/CharacterArray";
import background from "../../static/image/characterimages/bkgnd.png";

const MAP_CONSTANTS = {};
MAP_CONSTANTS.IMG_WIDTH = 116;
MAP_CONSTANTS.IMG_HEIGHT = 125;
MAP_CONSTANTS.KEY_LEFT = 37;
MAP_CONSTANTS.KEY_DOWN = 38;
MAP_CONSTANTS.KEY_RIGHT = 39;
MAP_CONSTANTS.KEY_UP = 40;
MAP_CONSTANTS.SPEED = 8;
MAP_CONSTANTS.FRAMES_LENGTH = 8;

const Main = ({ sendMyPosition, users, id }) => {
    const canvasRef = useRef(null);
    const requestAnimationRef = useRef(null);
    const [pressedKey, setPressedKey] = useState(null);
    let positions = [];
    let USER_INDEX;

    users.forEach((item, index) => {
        if (id === item.id) {
            USER_INDEX = index;
        }
        positions[index] = { x: item.x, y: item.y, dir: item.direction };
    });

    // TODO : 0번이 아니라 자기 자신이 움직이도록 코드 수정 필요
    const move = ({ x, y, dir }) => {
        const newX = positions[USER_INDEX].x + x;
        const newY = positions[USER_INDEX].y + y;
        if (newX < 0 || newX > canvasRef.current.width - MAP_CONSTANTS.IMG_WIDTH) return;
        if (newY < 0 || newY > canvasRef.current.height - MAP_CONSTANTS.IMG_HEIGHT) return;
        positions[USER_INDEX] = { x: newX, y: newY };
        sendMyPosition(newX, newY, dir);
    }; 

    const writeText = (info, style = {}) => {
        const context = canvasRef.current.getContext("2d");
        const { text, x, y } = info;
        const { fontSize = 20, fontFamily = "Arial", color = "black", textAlign = "center", textBaseline = "top" } = style;

        context.beginPath();
        context.font = fontSize + "px " + fontFamily;
        context.textAlign = textAlign;
        context.textBaseline = textBaseline;
        context.fillStyle = color;
        context.fillText(text, x, y);
        context.stroke();
    };

    const render = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        let characters = [];
        users.forEach((item) => {
            characters.push(new Image());
        });
        characters.forEach((character, index) => {
            switch(users[index].characterType){
                case "woman1":
                    character.src = characterImages.woman1[users[index].direction];
                    break;
                case "man1":
                    character.src = characterImages.man1[users[index].direction];
                    break;
                case "woman2":
                    character.src = characterImages.woman2[users[index].direction];
                    break;
                case "man2":
                    character.src = characterImages.man2[users[index].direction];
                    break;
                default:
                    character.src = characterImages.woman1[users[index].direction];
                    break;
            }
            character.onload = () => {
                if (index === 0) {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }
                writeText({ text: users[index].nickname, x: positions[index].x + 22, y: positions[index].y - 15 });
                context.drawImage(character, positions[index].x, positions[index].y);
            };
        });

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
                move({ x: 0, y: 0, dir: 0 });
                return;
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", (e) => {
            //e.preventDefault();
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
