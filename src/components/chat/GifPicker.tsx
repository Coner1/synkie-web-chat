interface Props {
    onSelect: (url: string) => void
}

const GIFS = [
    'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif'
]

export const GifPicker = ({ onSelect }: Props) => {
    return (
        <div className="grid grid-cols-3 gap-2 p-2">
            {GIFS.map(gif => (
                <img
                    key={gif}
                    src={gif}
                    className="rounded cursor-pointer"
                    onClick={() => onSelect(gif)}
                />
            ))}
        </div>
    )
}
