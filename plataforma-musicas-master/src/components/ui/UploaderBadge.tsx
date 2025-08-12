import { Upload, Crown } from 'lucide-react';

interface UploaderBadgeProps {
    isUploader?: boolean;
    uploaderLevel?: number;
    className?: string;
}

export default function UploaderBadge({ isUploader, uploaderLevel = 0, className = '' }: UploaderBadgeProps) {
    if (!isUploader) return null;

    const getLevelColor = (level: number) => {
        switch (level) {
            case 1:
                return 'bg-orange-500 text-white';
            case 2:
                return 'bg-orange-600 text-white';
            case 3:
                return 'bg-orange-700 text-white';
            default:
                return 'bg-orange-500 text-white';
        }
    };

    const getLevelText = (level: number) => {
        switch (level) {
            case 1:
                return 'Uploader';
            case 2:
                return 'Uploader Pro';
            case 3:
                return 'Uploader Elite';
            default:
                return 'Uploader';
        }
    };

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(uploaderLevel)} ${className}`}>
            <Upload className="w-4 h-4" />
            <span>{getLevelText(uploaderLevel)}</span>
            {uploaderLevel >= 3 && <Crown className="w-4 h-4" />}
        </div>
    );
} 