/**
 * 필요한 패키지 설치:
 * npm install express multer axios cors form-data
 */

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const FormData = require('form-data');

const app = express();
const PORT = 3000;
const FASTAPI_URL = 'http://localhost:8000/analyze';

// 미들웨어 설정
app.use(cors());
app.use(express.json());
// public 폴더 내의 정적 파일(index.html 등)을 서비스합니다.
app.use(express.static(path.join(__dirname, 'public')));

// Multer 설정: 이미지 파일을 메모리에 임시 저장
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 이미지 분석 요청을 FastAPI 서버로 전달하는 프록시 엔드포인트
 */
app.post('/proxy-analyze', upload.single('image'), async (req, res) => {
    try {
        const { question } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: '업로드된 이미지가 없습니다.' });
        }

        // FastAPI의 multipart/form-data 형식에 맞게 데이터 재구성
        const formData = new FormData();
        formData.append('image', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });
        formData.append('question', question || '이미지를 분석해주세요.');

        // FastAPI 서버(localhost:8000)로 분석 요청 전송
        const response = await axios.post(FASTAPI_URL, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        // FastAPI로부터 받은 결과를 클라이언트에 그대로 반환
        res.json(response.data);
    } catch (error) {
        console.error('FastAPI 연동 에러:', error.message);
        res.status(500).json({
            success: false,
            message: 'AI 서버와 통신 중 에러가 발생했습니다.',
            error: error.message
        });
    }
});

// 3000번 포트에서 웹 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 웹 인터페이스가 시작되었습니다: http://localhost:${PORT}`);
});
