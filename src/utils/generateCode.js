const prisma = require("../config/prisma");

const generateCode = async () => {
    let code;
    let exists = true;
    
    while (exists) {
        code = Math.floor(1000 + Math.random() * 9000).toString(); 
        
        const existing = await prisma.organizations.findUnique({
      where: { code },
    });
       const existingProject = await prisma.organizations.findUnique({
      where: { code },
    });
    
    
    if (!existing) exists = false;
    if (!existingProject) exists = false;

}

return code;
};
module.exports = { generateCode };
