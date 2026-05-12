import { useState } from "react";

interface ProductGalleryProps {
    images?: { id: string; image_url: string }[];
    thumbnail?: string;
}

export default function ProductGallery({ images, thumbnail }: ProductGalleryProps) {
    const allImages = [
        ...(thumbnail ? [{ id: "thumb", image_url: thumbnail }] : []),
        ...(images || []),
    ];

    const [activeImg, setActiveImg] = useState<string>(
        allImages.length > 0 ? allImages[0].image_url : "/placeholder.jpg"
    );

    return (
        <div className="space-y-4">
            <div className="w-full aspect-[16/9] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                    src={activeImg}
                    alt="Product Main"
                    className="w-full h-full object-cover transition-opacity duration-300"
                />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img) => (
                    <button
                        key={img.id}
                        onClick={() => setActiveImg(img.image_url)}
                        className={`flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 transition-all ${activeImg === img.image_url
                                ? "border-blue-600 opacity-100 shadow-md"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                    >
                        <img src={img.image_url} alt="Thumbnail" className="w-full h-full object-cover bg-gray-100" />
                    </button>
                ))}
            </div>
        </div>
    );
}