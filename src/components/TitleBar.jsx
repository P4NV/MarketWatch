import { Minus,Square,X } from 'lucide-react'
import {getCurrentWindow} from "@tauri-apps/api/window";

export default function TitleBar() {

    const appWindow = getCurrentWindow();

    const minimize = () => {
        return appWindow.minimize();
    }
    const maximize = () => {
        return appWindow.maximize();
    }
    const closeWindow = () => {
        return appWindow.close();
    }


    return(
        <div data-tauri-drag-region className="flex justify-end items-center bg-blue-700 gap-0 h-8 pr-2">
            <div className='h-full flex justify-center items-center px-2 hover:bg-gray-400'>
                <button onClick={minimize} className=''>
                    <Minus size={20} stroke={'white'} strokeWidth={7}/>
                </button>
            </div>
            <div className='h-full flex justify-center items-center px-2 hover:bg-gray-400'>
                <button onClick={maximize} className=''>
                    <Square size={20} stroke={'white'} strokeWidth={4}/>
                </button>
            </div>
            <div className='h-full flex justify-center items-center px-2 hover:bg-gray-400'>
                <button onClick={closeWindow} className=''>
                    <X size={20} stroke={'white'} strokeWidth={5}/>
                </button>
            </div>
        </div>
    )

}