import express from "express";
const router = express.Router();
function isActiveRoute(route, currentRoute){
    return route === currentRoute ? 'active': ''
}

export default router;