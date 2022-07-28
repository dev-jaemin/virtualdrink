import React, { useEffect, useRef, useState } from "react";
import characterImages from "../user/CharacterArray";
import background from "../../static/image/background/restaurant.jpeg";
import "./canvas.css";

const MAP_CONSTANTS = {};
MAP_CONSTANTS.IMG_WIDTH = 50;
MAP_CONSTANTS.IMG_HEIGHT = 60;
MAP_CONSTANTS.KEY_LEFT = 37;
MAP_CONSTANTS.KEY_DOWN = 38;
MAP_CONSTANTS.KEY_RIGHT = 39;
MAP_CONSTANTS.KEY_UP = 40;
MAP_CONSTANTS.SPEED = 3;
MAP_CONSTANTS.FRAMES_LENGTH = 8;

const CHAT_DURATION = 3000;

const Main = ({ sendMyPosition, users, id, chatData }) => {
    const canvasRef = useRef(null);
    const requestAnimationRef = useRef(null);
    const [pressedKey, setPressedKey] = useState(null);
    const date = new Date();
    const [bubbles, setBubbles] = useState([]);
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
        const { fontSize = 10, fontFamily = "Spoqa Han Sans Neo", color = "#ffffff", textAlign = "center", textBaseline = "top" } = style;

        context.beginPath();
        context.font = fontSize + "px " + fontFamily;
        context.textAlign = textAlign;
        context.textBaseline = textBaseline;
        context.fillStyle = color;
        context.fillText(text, x, y);
        context.stroke();
    };

    const render = () => {
        var time = date.getTime();
        var frame = (0 <= time % 200 && time % 200 <= 99) + 0;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        let characters = [];
        users.forEach(() => {
            characters.push(new Image());
        });
        characters.forEach((character, index) => {
            switch (users[index].characterType) {
                case "woman1":
                    character.src = characterImages.woman1[users[index].direction][frame];
                    break;
                case "man1":
                    character.src = characterImages.man1[users[index].direction][frame];
                    break;
                case "woman2":
                    character.src = characterImages.woman2[users[index].direction][frame];
                    break;
                case "man2":
                    character.src = characterImages.man2[users[index].direction][frame];
                    break;
                default:
                    character.src = characterImages.woman1[users[index].direction][frame];
                    break;
            }
            character.onload = () => {
                if (index === 0) {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }
                writeText({ text: users[index].nickname, x: positions[index].x + 20, y: positions[index].y + 70 });

                // for speech bubble
                const userBubbles = bubbles.filter((item) => item.nickname === users[index].nickname);
                if (userBubbles[userBubbles.length - 1]) {
                    writeText({ text: userBubbles[userBubbles.length - 1].text, x: positions[index].x + 20, y: positions[index].y - 10 });
                }

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

    useEffect(() => {
        if (chatData.length >= 1) {
            const lastChat = chatData[chatData.length - 1];

            setBubbles([...bubbles, lastChat]);

            setTimeout(() => {
                setBubbles(bubbles.filter((item, index) => index !== 0));
            }, CHAT_DURATION);
        }
    }, [chatData]);

    return (
        <canvas
            ref={canvasRef}
            className="field"
            style={{
                backgroundImage: `url(${background})`,
                backgroundSize: "90%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}
        ></canvas>
    );
};

export default Main;
