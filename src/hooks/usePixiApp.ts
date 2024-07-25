import { useEffect } from "react";
import { Application } from "pixi.js";

export function usePixiApp(width:number, height:number) {
    useEffect(() => {
        const app = new Application({ width, height });
        document.body.appendChild(app.view);

        return () => {
            app.destroy(true);
        };
    }, [width, height]);

    return null; // Return null because no UI component is rendered
}
