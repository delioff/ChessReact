import { createRoot } from "react-dom/client";
import React from 'react';
import App from './App';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import {DndProvider,TouchTransition, MouseTransition } from 'react-dnd-multi-backend'

export const HTML5toTouch = {
    backends: [
        {
            id: 'html5',
            backend: HTML5Backend,
            transition: MouseTransition,
        },
        {
            id: 'touch',
            backend: TouchBackend,
            options: { enableMouseEvents: true },
            preview: true,
            transition: TouchTransition,
        },
    ],
}
const root = createRoot(document.getElementById('root'));

root.render(<React.StrictMode>
    <DndProvider options={HTML5toTouch}>
        <App />
    </DndProvider>
</React.StrictMode>);

