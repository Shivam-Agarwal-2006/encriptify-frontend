// Base App layout reused with 4 different color schemes
import { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
const Manager = ({ theme }) => {
    const themeConfig = {
        cyberpunk: {
            bg: 'bg-[#0f0c29]',
            text: 'text-[#f0f0f0]',
            input: 'bg-[#302b63]',
            encrypt: 'from-purple-500 to-pink-500',
            decrypt: 'from-yellow-400 to-orange-500'
        },
        forest: {
            bg: 'bg-[#0d1b2a]',
            text: 'text-[#e0f7fa]',
            input: 'bg-[#1b263b]',
            encrypt: 'from-lime-400 to-emerald-500',
            decrypt: 'from-teal-400 to-cyan-500'
        },
        nebula: {
            bg: 'bg-[#1a1a40]',
            text: 'text-[#e0d4fd]',
            input: 'bg-[#2d2d6a]',
            encrypt: 'from-indigo-400 to-purple-600',
            decrypt: 'from-rose-400 to-pink-600'
        },
        minimal: {
            bg: 'bg-[#f4f6f8]',
            text: 'text-[#1f2937]',
            input: 'bg-white',
            encrypt: 'from-sky-400 to-blue-500',
            decrypt: 'from-red-400 to-pink-500'
        }
    };
    const colors = themeConfig[theme] || themeConfig.cyberpunk;
    const [key, setKey] = useState("");
    const [text, setText] = useState("");
    const [output, setOutput] = useState("");
    const [firstrun, setFirstRun] = useState(true);
    const [isFetching, setIsFetching] = useState(false)
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const generateRandomMap = () => {
        const asciiMap = {};
        for (let i = 32; i < 127; i++) {
            let rand = () => String.fromCharCode(Math.floor(Math.random() * 95) + 32); // printable ASCII
            asciiMap[String.fromCharCode(i)] = rand() + rand() + rand();
        }
        const reverseMap = {};
        for (let key in asciiMap) {
            reverseMap[asciiMap[key]] = key;
        }
        return { asciiMap, reverseMap }
    }
    const mapsRef = useRef({});
    const addMapToMongoDB = async (key) => {
        const generated = generateRandomMap();
        await fetch(`${BACKEND_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                key: key,
                asciiMap: generated.asciiMap,
                reverseMap: generated.reverseMap
            })
        });
    }
    const retrieveMapFromMongoDB = async (key) => {
        let didRespond = false;
        const timeoutId = setTimeout(() => {
            if (!didRespond) {
                toast.info("Waking up server... please wait ⏳", {
                    autoClose: 18000
                });
            }
        }, 4000);

        const res = await fetch(`${BACKEND_URL}/?key=${encodeURIComponent(key)}`);
        didRespond = true;
        clearTimeout(timeoutId);
        if (res.ok) {
            const entry = await res.json();
            mapsRef.current[key] = {
                asciiMap: entry.asciiMap,
                reverseMap: entry.reverseMap
            };
        }
        else {
            await addMapToMongoDB(key);
            await retrieveMapFromMongoDB(key);
        }
    }
    const transform = async (text, method, key) => {
        if (text.length == 0) {
            toast.error("Please enter some text to encrypt or decrypt")
            return "";
        }
        if (key.length > 3) {
            if (!mapsRef.current[key]) {
                // If the key is not in the maps, retrieve it from MongoDB
                setIsFetching(true);
                await retrieveMapFromMongoDB(key);
                setIsFetching(false);
            }
            const { asciiMap, reverseMap } = mapsRef.current[key]
            let res = ""
            if (method == "Encrypt") {
                for (let i = 0; i < text.length; i++) {
                    res += asciiMap[text[i]];
                }
            }
            else if (method == "Decrypt") {
                for (let i = 0; i < text.length; i += 3) {
                    if (i + 2 >= text.length) {
                        toast.error("The text entered is not correct");
                        return "";
                    }
                    const chunk = text[i] + text[i + 1] + text[i + 2];
                    if (!(chunk in reverseMap)) {
                        toast.error("The key entered is not correct");
                        return "";
                    }
                    res += reverseMap[text[i] + text[i + 1] + text[i + 2]];
                }
            }
            return res;
        }
        else {
            toast.error("Key should be of atleast 4 characters")
        }
    }
    const handleEncrypt = async () => {
        if (key.length < 4) {
            toast.error("Key should be of at least 4 characters");
            return;
        }
        if (!mapsRef.current[key]) {
            toast.info("⚡ Just a moment! It might take some time.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
            });
        }
        let res = await transform(text, "Encrypt", key);
        setOutput(res);
    }
    const handleDecrypt = async () => {
        if (key.length < 4) {
            toast.error("Key should be of at least 4 characters");
            return;
        }
        if (!mapsRef.current[key]) {
            toast.info("⚡ Just a moment! It might take some time.", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
            });
        }
        let res = await transform(text, "Decrypt", key);
        setOutput(res);
    }
    const handleKeyChange = (e) => {
        setKey(e.target.value)
    }
    const handleTextChange = (e) => {
        setText(e.target.value)
    }
    const handleCopy = async (value) => {
        try {
            await navigator.clipboard.writeText(value);
            toast('🦄 Copied to Clipboard!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        } catch (err) {
            // fallback
            const el = document.createElement('textarea');
            el.value = value;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            toast('🦄 Copied to Clipboard!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }
    };

    const handleClearText = () => {
        setText("");
    };

    const handleClearOutput = () => {
        setOutput("");
    };
    return (
        <main className={`${colors.bg} flex flex-col items-center px-4 py-10 ${colors.text} font-sans`}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
            <h1 className="text-4xl font-bold mb-10 tracking-wide"> 🔐Encriptify</h1>

            <div className="flex flex-col items-center w-full max-w-3xl gap-4">

                {/* Input Textarea */}
                <textarea
                    placeholder="Enter the text to encrypt or decrypt..."
                    value={text}
                    onChange={handleTextChange}
                    className={`${colors.input} w-full h-40 p-4 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-400 resize-none`}
                ></textarea>

                <div className="flex gap-4 self-end">
                    <button onClick={() => handleCopy(text)} className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 cursor-pointer">
                        Copy
                    </button>
                    <button onClick={handleClearText} className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer">
                        Clear
                    </button>
                </div>

                {/* Key Input */}
                <input
                    type="text"
                    value={key}
                    onChange={handleKeyChange}
                    placeholder="Enter secret key"
                    className={`${colors.input} w-full p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder-gray-400`}
                />

                {/* Buttons */}
                <div className="flex flex-wrap justify-center gap-6 my-2 w-full">
                    <button onClick={handleEncrypt} className={`bg-gradient-to-r ${colors.encrypt} text-white font-semibold px-6 py-2 rounded-xl shadow-xl transition-all duration-200 cursor-pointer hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600`}>
                        Encrypt
                    </button>
                    <button onClick={handleDecrypt} className={`bg-gradient-to-r ${colors.decrypt} text-white font-semibold px-6 py-2 rounded-xl shadow-xl transition-all duration-200 cursor-pointer hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-600`}>
                        Decrypt
                    </button>
                </div>

                {/* Output Textarea */}
                <textarea
                    placeholder={isFetching ? "Please wait...it may take longer time than expected to wake up the server..." : "Output will be displayed here..."}
                    readOnly
                    value={output}
                    className={`${colors.input} w-full h-40 p-4 rounded-xl border border-gray-700 focus:outline-none resize-none placeholder-gray-400`}
                ></textarea>

                <div className="flex gap-4 self-end">
                    <button onClick={() => handleCopy(output)} className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 cursor-pointer">
                        Copy
                    </button>
                    <button onClick={handleClearOutput} className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer">
                        Clear
                    </button>
                </div>
            </div>
        </main>


    );
};

export default Manager;