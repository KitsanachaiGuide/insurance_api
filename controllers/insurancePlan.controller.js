const InsurancePlan = require('../models/insurancePlan.model');


exports.create = async (req, res) => {
  try {
    if (!req.body.name || !req.body.minAge || !req.body.maxAge || !req.body.monthlyPremium) {
      return res.status(400).send({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (name, minAge, maxAge, monthlyPremium)'
      });
    }

    // สร้างแผนประกันจากข้อมูลที่ส่งมา
    const insurancePlan = new InsurancePlan({
      name: req.body.name,
      description: req.body.description || '',
      minAge: req.body.minAge,
      maxAge: req.body.maxAge,
      monthlyPremium: req.body.monthlyPremium
    });

    // บันทึกแผนประกันลงฐานข้อมูล
    const data = await InsurancePlan.create(insurancePlan);
    res.status(201).json({
      message: 'บันทึกข้อมูลเรียบร้อยแล้ว',
      data: data
    });    
  } catch (err) {
    res.status(500).send({
      message: err.message || 'เกิดข้อผิดพลาดในการสร้างแผนประกัน'
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const data = await InsurancePlan.findAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลแผนประกัน'
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const data = await InsurancePlan.findById(req.params.id);
    
    if (!data) {
      return res.status(404).send({
        message: `ไม่พบแผนประกันหมายเลข ${req.params.id}`
      });
    }
    
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: `เกิดข้อผิดพลาดในการดึงข้อมูลแผนประกันหมายเลข ${req.params.id}`
    });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body.name || !req.body.minAge || !req.body.maxAge || !req.body.monthlyPremium) {
      return res.status(400).send({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (name, minAge, maxAge, monthlyPremium)'
      });
    }

    const id = req.params.id;
    
    // ตรวจสอบว่ามีแผนประกันหมายเลขนี้หรือไม่
    const existingPlan = await InsurancePlan.findById(id);
    if (!existingPlan) {
      return res.status(404).send({
        message: `ไม่พบแผนประกันหมายเลข ${id}`
      });
    }

    const data = await InsurancePlan.updateById(id, {
      name: req.body.name,
      description: req.body.description || existingPlan.description,
      minAge: req.body.minAge,
      maxAge: req.body.maxAge,
      monthlyPremium: req.body.monthlyPremium
    });
    
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: `เกิดข้อผิดพลาดในการอัพเดทแผนประกันหมายเลข ${req.params.id}`
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const existingPlan = await InsurancePlan.findById(id);
    if (!existingPlan) {
      return res.status(404).send({
        message: `ไม่พบแผนประกันหมายเลข ${id}`
      });
    }

    const data = await InsurancePlan.remove(id);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: `เกิดข้อผิดพลาดในการลบแผนประกันหมายเลข ${req.params.id}`
    });
  }
};

// แนะนำแผนประกันที่เหมาะสม
exports.suggestPlan = async (req, res) => {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!req.body.name || req.body.age === undefined || req.body.expectedPremium === undefined) {
      return res.status(400).send({
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (name, age, expectedPremium)'
      });
    }

    const { age, expectedPremium } = req.body;
    
    // ค้นหาแผนประกันที่เหมาะสม
    const plans = await InsurancePlan.suggestPlan(age, expectedPremium);
    
    if (plans.length === 0) {
      return res.send({
        message: 'ไม่พบแผนประกันที่เหมาะสม'
      });
    }
    
    res.send(plans);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'เกิดข้อผิดพลาดในการแนะนำแผนประกัน'
    });
  }
};

const User = require('../models/user.model');

exports.recommendForUser = async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้นี้' });
    }

    const plans = await InsurancePlan.suggestPlan(user.age, user.expectedPremium);

    let recommendedPlans = plans;

    if (!plans || plans.length === 0) {
      recommendedPlans = ['ไม่พบแผนประกันที่เหมาะสม'];
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        age: user.age,
        expectedPremium: user.expectedPremium
      },
      recommendedPlans: recommendedPlans
    });
    
  } catch (err) {
    console.error('Error recommending plan:', err);
    res.status(500).json({ message: 'ไม่สามารถแนะนำแผนประกันได้', error: err.message });
  }
};
