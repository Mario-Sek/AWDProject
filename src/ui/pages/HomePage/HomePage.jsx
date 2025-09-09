import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import useThreads from "../../../hooks/useThreads";
import useCars from "../../../hooks/useCars";
import useUsers from "../../../hooks/useUsers";
import hero from "../../../images/hero-img.png"
import discussion from "../../../images/diskusija.jpg"
import default_car from "../../../images/default-car.png"
import "./HomePage.css"
import CarSelector from "../../carSpecs/CarSelector";

const HomePage = () => {
    const {threads} = useThreads();
    const {cars} = useCars();
    const {users, findUserById} = useUsers();

    const [hover, setHover] = useState(false);

    // Count-up state
    const [counts, setCounts] = useState({threads: 0, users: 0, cars: 0});
    const finalCounts = {
        threads: threads.length,
        users: users.length || 100,
        cars: cars.length
    };

    useEffect(() => {
        const duration = 1500; // 1.5s animation
        const steps = 30;
        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            setCounts({
                threads: Math.floor((finalCounts.threads / steps) * currentStep),
                users: Math.floor((finalCounts.users / steps) * currentStep),
                cars: Math.floor((finalCounts.cars / steps) * currentStep)
            });
            if (currentStep >= steps) clearInterval(interval);
        }, duration / steps);
        return () => clearInterval(interval);
    }, [threads.length, users.length, cars.length]);

    return (
        <div style={styles.page}>

            {/* Hero Section */}
            <section style={styles.hero}>
                <div style={styles.heroOverlay}>
                    <h1 style={styles.title}>Your Garage. Your Voice.</h1>
                    <p style={styles.subtitle}>
                        Дискутирај, сподели искуства и спореди автомобили со заедницата.
                    </p>
                    <Link to="/threads" style={{
                        ...styles.ctaButton,
                        color: hover ? "#1e40af" : "#fff",
                        backgroundColor: hover ? "#fff" : "#1e40af",
                        transition: "color 0.3s, background-color 0.3s",
                    }}
                          onMouseEnter={() => setHover(true)}
                          onMouseLeave={() => setHover(false)}>Види Threads</Link>
                </div>
            </section>

            {/* Statistics Section */}
            <section style={styles.statsSection}>
                <div style={styles.statCard}>
                    <h2>{counts.threads}+</h2>
                    <p>Дискусии</p>
                </div>
                <div style={styles.statCard}>
                    <h2>{counts.users}+</h2>
                    <p>Членови</p>
                </div>
                <div style={styles.statCard}>
                    <h2>{counts.cars}+</h2>
                    <p>Автомобили</p>
                </div>
            </section>

            {/* Последни дискусии */}
            <section style={styles.section}>
                <div style={styles.threadsContainer}>
                    {/* Лева колона со текст */}
                    <div style={styles.threadsLeft}>
                        <h3 style={styles.threadsTitle}>Влези во дискусија</h3>
                        <p style={styles.threadsSubtitle}>
                            Сподели искуства со останатите членови или едноставно дознај нешто ново!
                        </p>
                        <img src={discussion} alt="discussion" style={styles.threadsImage}/>
                    </div>

                    {/* Десна колона со последните 3 дискусии */}
                    <div style={styles.threadsRight}>
                        <h2 style={{textAlign: "center"}}>Последни дискусии</h2>
                        {threads.slice(0, 3).map(thread => (
                            <div key={thread.id} style={styles.threadCard}>
                                <h3>{thread.title}</h3>
                                <p>{thread.description || "Краток опис..."}</p>
                                <Link to={`/threads/${thread.id}`}>Види повеќе</Link>
                            </div>
                        ))}

                        <Link to="/threads" className="see_more" style={{
                            ...styles.seeMore,
                            color: hover ? "#0f2470" : "#4f46e5",
                            transition: "color 0.3s"
                        }}
                              onMouseEnter={() => setHover(true)}
                              onMouseLeave={() => setHover(false)}>Погледни ги сите постови →</Link>
                    </div>
                </div>
            </section>

            {/* Популарни автомобили */}
            <section style={styles.section}>
                <div style={styles.carContainer}>
                    <h2 style={{textAlign: "center", marginTop: "-2rem", paddingTop: "2rem"}}>Некои од возилата на
                        нашите корисници</h2>
                    <div style={styles.carsList}>
                        {cars.slice(0, 5).map(car => (
                            <div key={car.id} style={styles.carCard}>
                                {car.image || car.imageUrl ? (
                                    <img
                                        src={car.image || car.imageUrl}
                                        alt={car.name}
                                        style={styles.carImage}
                                    />
                                ) : <img
                                    src={default_car}
                                    alt="default"
                                    style={styles.carImage}
                                />}
                                <div style={styles.carCardText}>
                                    <Link to={`/cars/${car.id}`}><h3>{car.make} {car.model}</h3></Link>
                                    <p> {car.fuel} {car.hp || "N/A"} HP
                                        <Link
                                            to={`/users/${car.userId}`}
                                            style={styles.carUsername}>
                                            {findUserById(car.userId)?.username}
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link to="/cars" style={{
                        ...styles.seeMore,
                        color: hover ? "#0f2470" : "#4f46e5",
                        transition: "color 0.3s"
                    }}
                          onMouseEnter={() => setHover(true)}
                          onMouseLeave={() => setHover(false)}>Погледни ги сите автомобили →</Link>

                </div>
            </section>

            {/* Car Comparison Section */}
            <section style={styles.carComparisonSection}>
                <h1 style={{textAlign: "center"}}>Заинтересирани за спецификациите на одредено возило?</h1>
                <p style={styles.specsPodnaslov}>Дојдовте на правилно место, овозможено ви е дури да направите и
                    споредба меѓу две возила</p>
                <div style={styles.carComparisonContainer}>
                    <CarSelector/>
                </div>
            </section>


        </div>
    );
};

const styles = {
    page: {
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#ECECE7",
        color: "#333"
    },
    hero: {
        position: "relative",
        height: "70vh",
        backgroundImage: `url(${hero})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    heroOverlay: {
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: "2rem",
        textAlign: "center",
        borderRadius: "10px",
        color: "white"
    },
    title: {fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem"},
    subtitle: {fontSize: "1.5rem", marginBottom: "1.5rem"},
    ctaButton: {
        padding: "0.8rem 1.5rem",
        backgroundColor: "#4f46e5",
        color: "white",
        textDecoration: "none",
        borderRadius: "8px",
        fontWeight: "600"
    },
    section: {
        padding: "3rem 4rem",
    },

    // STATISTICS
    statsSection: {
        display: "flex",
        justifyContent: "center",
        gap: "4rem",
        padding: "2rem 0",
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    },
    statCard: {
        textAlign: "center"
    },

    // THREADS (carousel)
    carousel: {
        display: "flex",
        flexDirection: "column", // вертикално
        gap: "1rem",
        padding: "1rem 0"
    },
    threadsContainer: {
        display: "flex",
        gap: "2rem",
        flexWrap: "wrap",
        marginTop: "1rem"
    },
    threadsLeft: {
        flex: "1",
        minWidth: "250px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff", // или можеш да ставиш слика со backgroundImage
        borderRadius: "10px",
        textAlign: "center",
        backgroundSize: "cover",
        backgroundPosition: "center"
    },
    threadsTitle: {
        fontSize: "1.8rem",
        fontWeight: "700",
        marginBottom: "1rem",
        color: "#333"
    },
    threadsSubtitle: {
        fontSize: "1.2rem",
        lineHeight: "1.5",
        color: "#555"
    },
    threadsRight: {
        flex: "1",
        minWidth: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
    },
    threadCard: {
        backgroundColor: "white",
        borderRadius: "5px",
        padding: "1rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        cursor: "pointer"
    },

    threadsImage: {
        marginBottom: "-7.2rem"
    },

// CARS (horizontal card layout)
    carsList: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        marginTop: "1rem",
        marginBottom: "3rem",
        width: "100%",
        maxWidth: "50rem",
        margin: "0 auto" // центрирано
    },
    carCard: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "0.8rem 0",
        borderBottom: "1px solid #ccc", // линија меѓу автомобилите
        cursor: "pointer",
        position: "relative"
    },

    carCardText: {
        display: "flex",
        flexDirection: "column",
    },


    seeMore: {
        display: "block",
        margin: "1.5rem auto 0 auto", // горе, автоматски лево-десно
        textDecoration: "none",
        color: "#4f46e5",
        fontWeight: "600",
        fontSize: "1.1rem",
        textAlign: "center"
    },
    carImage: {
        width: "120px",
        height: "80px",
        objectFit: "cover",
        borderRadius: "8px",
        marginRight: "0.8rem" // растојание помеѓу сликата и текстот
    },
    carContainer: {
        backgroundColor: "#fff",
        paddingBottom: "3rem",
        width: "100%",
        maxWidth: "900px", // поголем од картичките
        margin: "0 auto",
        borderRadius: "10px"
    },

    carUsername: {
        position: "absolute",
        bottom: "1.5rem",
        right: "0.5rem",
        fontSize: "0.9rem",
        color: "#4f46e5",
        fontWeight: "600"
    },
    carComparisonSection: {
        backgroundColor: "#fff", // бела позадина од крај до крај
        padding: "3rem 0",
        width: "100%"
    },
    carComparisonContainer: {
        maxWidth: "1200px", // ограничување на ширина за да не е премногу широко
        margin: "0 auto",
        padding: "0 2rem"
    },

    specsPodnaslov: {
        fontSize: "1.15rem",
        textAlign: "center"
    }


};

export default HomePage;
