import { useEffect } from "react";
import confetti from 'canvas-confetti';


const Confetti = () => {

    useEffect(() => {
        confetti({
            particleCount: 70,
            spread: 70,
            shapes: ['square'],
            colors: ['f52c4e', 'd01232', 'ff7640', 'ffcb3b', '15c662', 'ba44f5']
            // colors: ['#BA44F5']
        })
    }, [])
    
    return(
        null
    )
}

export default Confetti;