import { Minus,Square,X } from 'lucide-react'
import {getCurrentWindow} from "@tauri-apps/api/window";

export default function TitleBar() {

    const appWindow = getCurrentWindow();

    const minimize = () => {
        return appWindow.minimize();
    }
    const maximize = () => {
        return appWindow.toggleMaximize();
    }
    const closeWindow = () => {
        return appWindow.close();
    }


    return(
        <div data-tauri-drag-region className="flex w-full justify-end items-center bg-blue-700 gap-0 h-8 pr-2">
            <button onClick={minimize} className='h-full flex justify-center items-center px-2 hover:bg-gray-400/40'>
                <div>
                    <Minus size={20} stroke={'white'} strokeWidth={7}/>
                </div>
            </button>
            <button onClick={maximize} className='h-full flex justify-center items-center px-2 hover:bg-gray-400/40'>
                <div>
                    <Square size={20} stroke={'white'} strokeWidth={4}/>
                </div>
            </button>
            <button onClick={closeWindow} className='h-full flex justify-center items-center px-2 hover:bg-gray-400/40'>
                <div >
                    <X size={20} stroke={'white'} strokeWidth={5}/>
                </div>
            </button>
        </div>
    )

}