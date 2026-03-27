import { Routes, Route, Navigate } from 'react-router-dom';

import Grid from '@main/Grid.jsx';
import AllPurchases from "@bookmarks/AllPurchases.jsx";
import MyPurchases from "@bookmarks/MyPurchases.jsx";
import MyCommitments from "@bookmarks/MyCommitments.jsx";
import About from '@bookmarks/About.jsx';
import Auth from '@bookmarks/Auth.jsx';

/**
 * Provides all routes for the application.
 * @description This component serves as the main routing component for the application, defining all the routes and their corresponding components.
 * @returns App component with all routes.
 */
function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/vsechny-nakupy" />} />
            <Route path="/vsechny-nakupy" element={<Grid title="Seznam všech nákupů"><AllPurchases /></Grid>} />
            <Route path="/moje-nakupy" element={<Grid title="Seznam nákupů uživatele"><MyPurchases /></Grid>} />
            <Route path="/zavazkove-vztahy" element={<Grid title="Seznam závazkových vztahů uživatele"><MyCommitments /></Grid>} />
            <Route path="/o-aplikaci" element={<About />} />
            <Route path="/prihlaseni" element={<Auth />} />
            <Route path="*" element={<Navigate to="/vsechny-nakupy" />} />
        </Routes>
    );
}

export default App;