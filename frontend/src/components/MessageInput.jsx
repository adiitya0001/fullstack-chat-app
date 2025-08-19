import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chatty"); // Using the preset name you chose

    try {
        // =======================================================================
        // IMPORTANT: REPLACE "YOUR_CLOUD_NAME_HERE" WITH YOUR ACTUAL CLOUD NAME
        // =======================================================================
        const res = await fetch(
            "https://api.cloudinary.com/v1_1/dthqt6g0x/image/upload",
            {
                method: "POST",
                body: data,
            }
        );
        
        const jsonResponse = await res.json();
        if (!res.ok) {
            throw new Error(jsonResponse.error.message || "Image upload failed");
        }
        return jsonResponse.secure_url;
    } catch (error) {
        toast.error(error.message);
        return null;
    }
};

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef(null);
    const { sendMessage } = useChatStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        setImageFile(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (isSending || (!text.trim() && !imageFile)) return;

        setIsSending(true);
        let imageUrl = null;

        try {
            if (imageFile) {
                imageUrl = await uploadImageToCloudinary(imageFile);
                if (!imageUrl) {
                    setIsSending(false);
                    return;
                }
            }

            await sendMessage({
                text: text.trim(),
                image: imageUrl,
            });

            setText("");
            removeImage();
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-4 w-full">
            {imagePreview && (
                <div className="mb-3">
                    <div className="relative w-20 h-20">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                            type="button"
                            disabled={isSending}
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                />
                
                <button
                    type="button"
                    className="btn btn-ghost btn-circle"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                >
                    <Image size={20} className={imagePreview ? "text-primary" : ""} />
                </button>
                
                <input
                    type="text"
                    className="w-full input input-bordered rounded-lg flex-1"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isSending}
                />
                
                <button
                    type="submit"
                    className="btn btn-primary btn-circle"
                    disabled={isSending || (!text.trim() && !imageFile)}
                >
                    {isSending ? <span className="loading loading-spinner" /> : <Send size={22} />}
                </button>
            </form>
        </div>
    );
};

export default MessageInput;