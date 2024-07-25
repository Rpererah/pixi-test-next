'use client'
import React, { useEffect, useRef, useState } from "react";
import { Application, AnimatedSprite, Texture, Graphics } from "pixi.js";

// Definindo o tamanho da célula e as dimensões da grade
const CELL_SIZE = 100; // Tamanho de cada célula da grade
const GRID_WIDTH = 8; // Número de células na largura da tela
const GRID_HEIGHT = 6; // Número de células na altura da tela
const MOVE_SPEED = 5; // Velocidade de movimento do personagem
const JUMP_HEIGHT = 200; // Altura máxima do pulo
const JUMP_SPEED = 15; // Velocidade do pulo
const GRAVITY = 0.9; // Gravidade para o pulo

// Função para converter coordenadas de grade para coordenadas de tela
const getGridCoordinates = (x: number, y: number) => {
    return {
        screenX: x * CELL_SIZE,
        screenY: y * CELL_SIZE
    };
};

// Função para desenhar a grade no canvas
const drawGrid = (app: Application) => {
    const graphics = new Graphics();
    graphics.lineStyle(1, 0xaaaaaa, 0.5); // Cor e opacidade da linha
    for (let x = 0; x <= GRID_WIDTH; x++) {
        graphics.moveTo(x * CELL_SIZE, 0);
        graphics.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE);
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
        graphics.moveTo(0, y * CELL_SIZE);
        graphics.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE);
    }
    app.stage.addChild(graphics);
};

// Função para criar e adicionar um bloco ao stage
const createBlock = (app: Application, color: string, x: number, y: number, width: number, height: number) => {
    const { screenX, screenY } = getGridCoordinates(x, y);
    const graphics = new Graphics();
    graphics.beginFill(parseInt(color.replace('#', '0x'), 16));
    graphics.drawRect(screenX, screenY, width * CELL_SIZE, height * CELL_SIZE);
    graphics.endFill();
    app.stage.addChild(graphics);
};

// Função para criar blocos de chão
const createGroundBlocks = (app: Application) => {
    const groundColor = '#00ff00'; // Cor verde para o chão
    const groundHeight = 1; // Altura do bloco de chão
    for (let x = 0; x < GRID_WIDTH; x++) {
        createBlock(app, groundColor, x, GRID_HEIGHT - groundHeight, 1, groundHeight);
    }
};

// Função principal do componente
export default function Game() {
    const iddleRef = useRef<AnimatedSprite | null>(null);
    const isMovingLeft = useRef(false);
    const isMovingRight = useRef(false);
    const isJumping = useRef(false);
    const jumpStartY = useRef(0);
    const velocityY = useRef(0);
    const [blocks, setBlocks] = useState<any[]>([]);

    useEffect(() => {
        // Função para carregar o JSON com as informações dos blocos
        const loadBlockData = async () => {
            try {
                const response = await fetch('background.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Block data loaded:', data); // Log para verificar os dados
                setBlocks(data.blocks);
            } catch (error) {
                console.error('Failed to load block data:', error);
            }
        };

        loadBlockData();
    }, []);

    useEffect(() => {
        const app = new Application({
            width: GRID_WIDTH * CELL_SIZE,
            height: GRID_HEIGHT * CELL_SIZE
        });
        document.body.appendChild(app.view);

        // Desenhar a grade
        drawGrid(app);

        // Adicionar blocos de cor ao stage
        if (blocks.length > 0) {
            blocks.forEach(block => {
                createBlock(app, block.color, block.x, block.y, block.width, block.height);
            });
        } else {
            console.log('No blocks to display'); // Log caso não haja blocos
        }

        // Adicionar blocos de chão
        createGroundBlocks(app);

        // Carregar as texturas para o AnimatedSprite de 'Idle'
        const idleTextures = [];
        for (let i = 1; i <= 10; i++) {
            idleTextures.push(Texture.from(`/assets/Idle${i}.png`));
        }

        // Carregar as texturas para o AnimatedSprite de 'Run'
        const runSprites = [];
        for (let i = 1; i <= 8; i++) {
            runSprites.push(Texture.from(`/assets/Run${i}.png`));
        }

        // Carregar as texturas para o AnimatedSprite de 'Jump'
        const jumpTextures = [];
        for (let i = 1; i <= 12; i++) {
            jumpTextures.push(Texture.from(`/assets/Jump${i}.png`));
        }

        const iddle = new AnimatedSprite(idleTextures);
        iddle.anchor.set(0.5);
        iddle.animationSpeed = 0.3;
        iddle.x = app.renderer.width / 2;
        iddle.y = GRID_HEIGHT * CELL_SIZE - iddle.height / 2; // Inicialmente no chão
        iddle.height = 200;
        iddle.width = 200;
        iddle.play();
        app.stage.addChild(iddle);

        iddleRef.current = iddle; // Armazenar a referência do AnimatedSprite

        // Função para atualizar a posição do personagem
        const updatePosition = () => {
            const iddle = iddleRef.current;
            if (!iddle) return;

            // Atualizar a física do pulo
            if (isJumping.current) {
                console.log("Jumping..."); // Log para depuração
                if (iddle.textures !== jumpTextures) {
                    console.log("Switching to jump animation"); // Log para depuração
                    iddle.textures = jumpTextures;
                    iddle.animationSpeed = 0.2; // Velocidade da animação de pulo
                    iddle.gotoAndPlay(0); // Reiniciar a animação
                }
                iddle.y -= velocityY.current;
                velocityY.current -= GRAVITY;
                if (iddle.y >= GRID_HEIGHT * CELL_SIZE - iddle.height / 2) {
                    iddle.y = GRID_HEIGHT * CELL_SIZE - iddle.height / 2;
                    isJumping.current = false;
                    velocityY.current = 0;
                    console.log("Landing..."); // Log para depuração
                    iddle.textures = idleTextures; // Voltar para animação idle
                    iddle.animationSpeed = 0.3;
                    iddle.gotoAndPlay(0); // Reiniciar a animação
                }
            }

            // Atualizar a animação com base no movimento
            if (isMovingLeft.current) {
                iddle.x -= MOVE_SPEED;
                iddle.scale.x = -0.3; // Vira o sprite para a esquerda
                if (iddle.textures !== runSprites) {
                    console.log("Switching to run animation"); // Log para depuração
                    iddle.textures = runSprites;
                    iddle.animationSpeed = 0.3;
                    iddle.gotoAndPlay(0); // Reiniciar a animação
                }
            } else if (isMovingRight.current) {
                iddle.x += MOVE_SPEED;
                iddle.scale.x = 0.3; // Vira o sprite para a direita
                if (iddle.textures !== runSprites) {
                    console.log("Switching to run animation"); // Log para depuração
                    iddle.textures = runSprites;
                    iddle.animationSpeed = 0.3;
                    iddle.gotoAndPlay(0); // Reiniciar a animação
                }
            } else if (!isJumping.current && iddle.textures !== idleTextures) {
                console.log("Switching to idle animation"); // Log para depuração
                iddle.textures = idleTextures;
                iddle.animationSpeed = 0.3;
                iddle.gotoAndPlay(0); // Reiniciar a animação
            }
        };

        app.ticker.add(updatePosition);

        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowLeft':
                    isMovingLeft.current = true;
                    break;
                case 'ArrowRight':
                    isMovingRight.current = true;
                    break;
                case 'ArrowUp':
                    if (!isJumping.current) {
                        isJumping.current = true;
                        jumpStartY.current = iddleRef.current!.y;
                        velocityY.current = JUMP_SPEED;
                        console.log("Start Jump"); // Log para depuração
                    }
                    break;
                default:
                    break;
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowLeft':
                    isMovingLeft.current = false;
                    break;
                case 'ArrowRight':
                    isMovingRight.current = false;
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            app.destroy(true);
        };
    }, [blocks]);

    return <div></div>;
}
