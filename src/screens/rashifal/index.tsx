
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../components/firebase";
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Rashifal = () => {
    useEffect(() => {
        const fetchRashifal = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "rashifal"));
                const rashifalData = querySnapshot.docs.map(doc => doc.data());
                console.log("Rashifal data fetched:", rashifalData);
            } catch (error) {
                console.error("Error fetching rashifal data:", error);
            }
        }
        fetchRashifal();
    }, []);
    return (
        <div>Rashifal Screen</div>
    );

};

export default Rashifal;