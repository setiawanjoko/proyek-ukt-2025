function requireRole(...allowedRoles) {
  if (!allowedRoles.length || allowedRoles.some(role => typeof role !== 'string')) {
    throw new Error('Invalid roles: At least one valid string role is required');
  }
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
    }

    const userRole = req.user.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
}

module.exports = { requireRole };