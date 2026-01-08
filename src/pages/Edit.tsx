import { useState } from 'react'
import type { User } from '@/utils/makeInitData'
import { useNavigate } from 'react-router'
import storage from '@/utils/storage'

export const Edit = () => {
    const [userData, setUserData] = useState<User>(
        JSON.parse(localStorage.getItem('__tg_user') || '{}')
    )
    const [token, setToken] = useState<string>(storage.get('token') || '')
    const navigate = useNavigate()

    return (
        <div className="w-screen h-screen bg-black text-white">
            <h3 className="w-full p-2 flex justify-center items-center bg-[#181818] font-semibold">
                Edit Data
            </h3>

            <div className="w-full bg-[#181819] mt-2">
                <h3 className="pt-2 px-2 text-blue-500 font-semibold text-md">Bot API Token</h3>
                <div className="w-full">
                    <input
                        className="w-full p-2.5 outline-none"
                        placeholder="Bot Token"
                        defaultValue={token || ''}
                        onChange={(e) => setToken(e.target.value)}
                    />
                </div>
            </div>
            <p className="p-2 text-sm text-[#ccc]">
                Note: Bot token will use to create valid init data
            </p>

            <div className="w-full bg-[#181819] px-2">
                <h3 className="pt-2 text-blue-500 font-semibold text-md">User Data</h3>
                <div className="w-full">
                    <input
                        className="py-2.5 w-full outline-none border-b-1 border-b-[#333]"
                        placeholder="User ID"
                        defaultValue={userData.id || ''}
                        type="number"
                        onChange={(e) =>
                            setUserData((p) => ({ ...p, id: Number(e.target.value) }))
                        }
                    />
                </div>
                <div className="w-full">
                    <input
                        className="py-2.5 w-full outline-none border-b-1 border-b-[#333]"
                        placeholder="First name"
                        defaultValue={userData.first_name || ''}
                        onChange={(e) =>
                            setUserData((p) => ({ ...p, first_name: e.target.value }))
                        }
                    />
                </div>
                <div className="w-full">
                    <input
                        className="py-2.5 w-full outline-none border-b-1 border-b-[#333]"
                        placeholder="Last name"
                        defaultValue={userData.last_name || ''}
                        onChange={(e) =>
                            setUserData((p) => ({ ...p, last_name: e.target.value }))
                        }
                    />
                </div>
                <div className="w-full">
                    <input
                        className="py-2.5 w-full outline-none border-b-1 border-b-[#333]"
                        placeholder="Username"
                        defaultValue={userData.username || ''}
                        onChange={(e) =>
                            setUserData((p) => ({ ...p, username: e.target.value }))
                        }
                    />
                </div>
                <div className="w-full">
                    <input
                        className="py-2.5 w-full outline-none border-b-1 border-b-[#333]"
                        placeholder="Language code"
                        defaultValue={userData.language_code || ''}
                        onChange={(e) =>
                            setUserData((p) => ({ ...p, language_code: e.target.value }))
                        }
                    />
                </div>
                <div className="w-full">
                    <input
                        className="py-2.5 w-full outline-none"
                        placeholder="Photo URL"
                        defaultValue={userData.photo_url || ''}
                        onChange={(e) =>
                            setUserData((p) => ({ ...p, photo_url: e.target.value }))
                        }
                    />
                </div>
            </div>

            <div className="w-full flex justify-center items-center p-2 mt-2">
                <button
                    className="w-[100%] bg-blue-500 rounded-xl p-2"
                    onClick={() => {
                        const data = JSON.stringify(userData || {})
                        localStorage.setItem('__tg_user', data)
                        storage.set('token', token)
                        window.histroy.back()
                    }}
                >
                    Save
                </button>
            </div>
        </div>
    )
}
