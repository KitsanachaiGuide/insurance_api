const User = require('../models/user.model');
const InsurancePlan = require('../models/insurancePlan.model');

exports.create = async (req, res) => {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!req.body.name || req.body.age === undefined || req.body.expectedPremium === undefined) {
      return res.status(400).send({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (name, age, expectedPremium)'
      });
    }

    if (req.body.age < 0 || req.body.age > 120) {
      return res.status(400).send({
        message: 'อายุไม่ถูกต้อง (ต้องอยู่ระหว่าง 0-120)'
      });
    }
    
    if (req.body.expectedPremium < 0) {
      return res.status(400).send({
        message: 'งบประมาณไม่ถูกต้อง (ต้องมากกว่า 0)'
      });
    }

    const user = new User({
      name: req.body.name,
      age: req.body.age,
      expectedPremium: req.body.expectedPremium,
      isActive: true
    });

    const savedUser = await User.create(user);
    
    // const plans = await InsurancePlan.suggestPlan(user.age, user.expectedPremium);
    
    res.status(201).send({
      message: `บันทึกข้อมูลของคุณ ${user.name} เรียบร้อยแล้ว`,
      user: savedUser
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'เกิดข้อผิดพลาดในการสร้างข้อมูลผู้ใช้'
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    // รับพารามิเตอร์ showAll จาก query string
    const includeInactive = req.query.showAll === 'true';
    const data = await User.findAll(includeInactive);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้'
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    // รับพารามิเตอร์ showAll จาก query string
    const includeInactive = req.query.showAll === 'true';
    const data = await User.findById(req.params.id, includeInactive);
    
    if (!data) {
      return res.status(404).send({
        message: `ไม่พบข้อมูลผู้ใช้หมายเลข ${req.params.id}`
      });
    }
    
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: `เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้หมายเลข ${req.params.id}`
    });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body.name || req.body.age === undefined || req.body.expectedPremium === undefined) {
      return res.status(400).send({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (name, age, expectedPremium)'
      });
    }

    if (req.body.age < 0 || req.body.age > 120) {
      return res.status(400).send({
        message: 'อายุไม่ถูกต้อง (ต้องอยู่ระหว่าง 0-120)'
      });
    }
    
    if (req.body.expectedPremium < 0) {
      return res.status(400).send({
        message: 'งบประมาณไม่ถูกต้อง (ต้องมากกว่า 0)'
      });
    }

    const id = req.params.id;
    
    // ตรวจสอบว่ามีข้อมูลผู้ใช้หมายเลขนี้หรือไม่ (รวมทั้งที่ inactive)
    const existingUser = await User.findById(id, true);
    if (!existingUser) {
      return res.status(404).send({
        message: `ไม่พบข้อมูลผู้ใช้หมายเลข ${id}`
      });
    }

    const updatedUser = {
      name: req.body.name,
      age: req.body.age,
      expectedPremium: req.body.expectedPremium,
      isActive: req.body.isActive !== undefined ? req.body.isActive : existingUser.isActive
    };
    
    const data = await User.updateById(id, updatedUser);
    
    // ค้นหาแผนประกันที่เหมาะสมตามข้อมูลใหม่
    // const plans = await InsurancePlan.suggestPlan(updatedUser.age, updatedUser.expectedPremium);
    
    res.send({
      message: `อัพเดทข้อมูลของคุณ ${updatedUser.name} เรียบร้อยแล้ว`,
      user: data
    });
  } catch (err) {
    res.status(500).send({
      message: `เกิดข้อผิดพลาดในการอัพเดทข้อมูลผู้ใช้หมายเลข ${req.params.id}`
    });
  }
};

// Soft Delete
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    // ตรวจสอบว่ามีข้อมูลผู้ใช้หมายเลขนี้หรือไม่
    const existingUser = await User.findById(id, true);
    if (!existingUser) {
      return res.status(404).send({
        message: `ไม่พบข้อมูลผู้ใช้หมายเลข ${id}`
      });
    }

    // ถ้าข้อมูลผู้ใช้ไม่ active อยู่แล้ว
    if (!existingUser.isActive) {
      return res.status(400).send({
        message: `ข้อมูลผู้ใช้หมายเลข ${id} ถูกลบไปแล้ว`
      });
    }

    const data = await User.remove(id);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: `เกิดข้อผิดพลาดในการปิดการใช้งานข้อมูลผู้ใช้หมายเลข ${req.params.id}`
    });
  }
};

// เปิดการใช้งานข้อมูลผู้ใช้
exports.activate = async (req, res) => {
  try {
    const id = req.params.id;
    
    // ตรวจสอบว่ามีข้อมูลผู้ใช้หมายเลขนี้หรือไม่
    const existingUser = await User.findById(id, true);
    if (!existingUser) {
      return res.status(404).send({
        message: `ไม่พบข้อมูลผู้ใช้หมายเลข ${id}`
      });
    }

    // ถ้าข้อมูลผู้ใช้ active อยู่แล้ว
    if (existingUser.isActive) {
      return res.status(400).send({
        message: `ข้อมูลผู้ใช้หมายเลข ${id} ยังไม่ถูกลบ`
      });
    }

    // เปิดการใช้งานข้อมูลผู้ใช้
    const data = await User.updateById(id, {
      ...existingUser,
      isActive: true
    });
    
    res.send({ message: `กู้คืนข้อมูลผู้ใช้หมายเลข ${id} แล้ว` });
  } catch (err) {
    res.status(500).send({
      message: `เกิดข้อผิดพลาดในการกู้คืนข้อมูลผู้ใช้หมายเลข ${req.params.id}`
    });
  }
};

// ดึงแผนประกันที่แนะนำสำหรับผู้ใช้
exports.getSuggestedPlans = async (req, res) => {
  try {
    const id = req.params.id;
    
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).send({
        message: `ไม่พบข้อมูลผู้ใช้หมายเลข ${id}`
      });
    }

    // ค้นหาแผนประกันที่เหมาะสม
    const { user, plans } = await User.getSuggestedPlans(id);
    
    if (plans.length === 0) {
      return res.status(404).send({
        message: `ไม่พบแผนประกันที่เหมาะสม ${user.name}`,
        user: user
      });
    }
    
    res.send({
      message: `พบแผนประกันที่เหมาะสมสำหรับคุณ ${user.name} จำนวน ${plans.length} แผน`,
      user: user,
      plans: plans
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || `เกิดข้อผิดพลาดในการดึงแผนประกันที่แนะนำสำหรับผู้ใช้หมายเลข ${req.params.id}`
    });
  }
};