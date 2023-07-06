import React from 'react'
import ReactDOM from 'react-dom/client'
import { observer } from 'mobx-react'
import { AStore } from '../main/astore'

import { SpCheckBox, SpMenu } from '../util/elements'
import Locale from '../locale/locale'
import globalStore from '../globalstore'
import { io } from '../util/oldSystem'
import { reaction } from 'mobx'
// import { Jimp } from '../util/oldSystem'
declare const Jimp: any // make sure you import jimp before importing settings.tsx

type InterpolationMethod = {
    [key: string]: {
        photoshop: string
        jimp: string
    }
}

const interpolationMethods: InterpolationMethod = {
    nearestNeighbor: {
        photoshop: 'nearestNeighbor',
        jimp: Jimp.RESIZE_NEAREST_NEIGHBOR,
    },
    bicubic: {
        photoshop: 'bicubicAutomatic',
        jimp: Jimp.RESIZE_BICUBIC,
    },
    bilinear: {
        photoshop: 'bilinear',
        jimp: Jimp.RESIZE_BILINEAR,
    },
}

export const store = new AStore({
    scale_interpolation_method: interpolationMethods.bilinear,
    should_log_to_file: false,
    delete_log_file_timer_id: null,
})
function onShouldLogToFileChange(event: any) {
    try {
        const should_log_to_file: boolean = event.target.checked
        store.data.should_log_to_file = should_log_to_file
        if (should_log_to_file && !store.data.delete_log_file_timer_id) {
            store.data.delete_log_file_timer_id = setDeleteLogTimer()
        } else {
            //don't log and clear delete file timer
            try {
                store.data.delete_log_file_timer_id = clearInterval(
                    store.data.delete_log_file_timer_id
                )
            } catch (e) {
                console.warn(e)
            }
        }

        //@ts-ignore
        setLogMethod(should_log_to_file)
    } catch (e) {
        console.warn(e)
    }
}

function setDeleteLogTimer() {
    const timer_id = setInterval(async () => {
        await io.deleteFileIfLargerThan('log.txt', 200)
    }, 2 * 60 * 1000)
    console.log('setDeleteLogTimer() timer_id :', timer_id)
    return timer_id
}
// reaction(
//     () => {
//         return store.data.should_log_to_file
//     },
//     (should_log_to_file) => {
//         if (should_log_to_file && !store.data.delete_log_file_timer_id) {
//             store.data.delete_log_file_timer_id = setDeleteLogTimer()
//         } else {
//             //don't log and clear delete file timer
//             try {
//                 store.data.delete_log_file_timer_id = clearInterval(
//                     store.data.delete_log_file_timer_id
//                 )
//             } catch (e) {
//                 console.warn(e)
//             }
//         }

//         //@ts-ignore
//         setLogMethod(should_log_to_file)
//     }
// )
const Settings = observer(() => {
    return (
        <div style={{ width: '100%' }}>
            <SpMenu
                title="select an interploation method for resizing images"
                items={Object.keys(interpolationMethods)}
                label_item="Select Interpolation Method"
                selected_index={Object.keys(interpolationMethods).findIndex(
                    (key) => {
                        return (
                            interpolationMethods[key].photoshop ===
                                store.data.scale_interpolation_method
                                    .photoshop &&
                            interpolationMethods[key].jimp ===
                                store.data.scale_interpolation_method.jimp
                        )
                    }
                )}
                onChange={(id: any, value: any) => {
                    store.updateProperty(
                        'scale_interpolation_method',
                        interpolationMethods[value.item]
                    )
                }}
            ></SpMenu>
            <sp-label>select language</sp-label>
            <SpMenu
                title="select language"
                items={['en_US', 'zh_CN']}
                label_item="select language"
                selected_index={['en_US', 'zh_CN'].indexOf(globalStore.Locale)}
                onChange={(id: any, value: any) => {
                    globalStore.Locale = value.item
                    localStorage.setItem('last_selected_locale', value.item)
                    console.log(localStorage.getItem('last_selected_locale'))
                }}
            ></SpMenu>
            <SpCheckBox
                style={{
                    marginRight: '10px',
                }}
                onChange={onShouldLogToFileChange}
                checked={store.data.should_log_to_file}
            >
                {
                    //@ts-ignore
                    Locale('Log Errors To File')
                }
            </SpCheckBox>
        </div>
    )
})

const containerNode = document.getElementById('reactSettingsContainer')!
const root = ReactDOM.createRoot(containerNode)

root.render(
    <React.StrictMode>
        <Settings></Settings>
    </React.StrictMode>
)
