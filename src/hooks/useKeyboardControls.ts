// useKeyboardControls.ts
import { useEffect } from 'react';

export function useKeyboardControls (spriteRef: React.MutableRefObject<any>, moveSpeed: number, jumpSpeed: number, gravity: number): void  {
    useEffect(() => {
        let isMovingLeft = false;
        let isMovingRight = false;
        let isJumping = false;
        let jumpStartY = 0;
        let velocityY = 0;

        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowLeft':
                    isMovingLeft = true;
                    break;
                case 'ArrowRight':
                    isMovingRight = true;
                    break;
                case 'ArrowUp':
                    if (!isJumping) {
                        isJumping = true;
                        jumpStartY = spriteRef.current.y;
                        velocityY = jumpSpeed;
                    }
                    break;
                default:
                    break;
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowLeft':
                    isMovingLeft = false;
                    break;
                case 'ArrowRight':
                    isMovingRight = false;
                    break;
                default:
                    break;
            }
        };

        const updatePosition = () => {
            if (isMovingLeft) {
                spriteRef.current.x -= moveSpeed;
            } else if (isMovingRight) {
                spriteRef.current.x += moveSpeed;
            }

            if (isJumping) {
                spriteRef.current.y -= velocityY;
                velocityY -= gravity;

                // Lógica de aterrisagem
                if (spriteRef.current.y >= jumpStartY) {
                    spriteRef.current.y = jumpStartY;
                    isJumping = false;
                    velocityY = 0;
                }
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            handleKeyDown(event);
        };

        const onKeyUp = (event: KeyboardEvent) => {
            handleKeyUp(event);
        };

        const gameLoop = () => {
            updatePosition();
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        const interval = setInterval(gameLoop, 1000 / 60); // 60 FPS

        return () => {
            clearInterval(interval);
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
        };
    }, [spriteRef, moveSpeed, jumpSpeed, gravity]);
};

