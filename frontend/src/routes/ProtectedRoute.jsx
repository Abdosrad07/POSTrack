import React from 'react';
/** Route neutre : la navigation n'est plus bloquée par la présence d'un JWT. */
const ProtectedRoute = ({ children }) => children;

export default ProtectedRoute;
