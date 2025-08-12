const axios = require('axios');

const ZK_API = 'http://192.168.1.201:8081'; // Replace with your device server IP

async function getAttendanceLogs() {
  try {
    const res = await axios.get(`${ZK_API}/attendance/`, {
      headers: { Authorization: `Bearer ${process.env.ZKTECO_TOKEN}` }
    });
    return res.data;
  } catch (err) {
    console.error('Error fetching attendance logs:', err.message);
    return [];
  }
}

module.exports = {
  getAttendanceLogs
};
