let video;
let faceMesh;
let faces = [];

function preload() {
  // 載入 ml5.js v1 的 faceMesh 模型
  // 在 preload 載入可確保 setup 執行前模型已準備就緒
  faceMesh = ml5.faceMesh({ maxFaces: 1, refineLandmarks: false, flipHorizontal: false });
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  video = createCapture(VIDEO, (stream) => {
    console.log("攝影機已啟動");
  });
  video.size(640, 480); // 設定固定解析度以利辨識座標對應
  video.hide();

  // 開始持續偵測臉部特徵點
  faceMesh.detectStart(video, gotFaces);
}

function gotFaces(results) {
  // 將辨識結果存入 faces 變數
  faces = results;
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');

  let w = width * 0.5; // 畫布寬度的 50%
  let h = height * 0.5; // 畫布高度的 50%
  let x = (width - w) / 2; // 置中水平座標
  let y = (height - h) / 2; // 置中垂直座標

  // 設定文字樣式並繪製文字
  fill(0); // 黑色文字
  textSize(24); // 文字大小
  textAlign(CENTER, TOP); // 水平置中，垂直靠上
  
  text("412730227陳永泰", width / 2, 20); // 第一行文字，距離頂部 20 像素
  text("作品為影像辨識_耳環臉譜", width / 2, 50); // 第二行文字，距離頂部 50 像素

  push();
  // 將座標系移動到影像預定位置的右緣，準備進行翻轉
  translate(x + w, y);
  // 水平翻轉 (x 軸 -1)
  scale(-1, 1);
  // 繪製影像
  image(video, 0, 0, w, h);

  // 若辨識到臉部，則在左右耳垂處畫出三個黃色圓圈 (耳環效果)
  if (faces.length > 0) {
    let face = faces[0];
    // MediaPipe Face Mesh 特徵點索引：177 為左耳垂區域，401 為右耳垂區域
    if (face.keypoints[132]) drawEarring(face.keypoints[132], w, h);
    if (face.keypoints[361]) drawEarring(face.keypoints[361], w, h);
  }
  pop();
}

function drawEarring(pt, imgW, imgH) {
  if (!pt) return;
  // 將偵測到的影片座標對應到畫面上顯示的影像大小
  let px = map(pt.x, 0, video.width, 0, imgW);
  let py = map(pt.y, 0, video.height, 0, imgH);

  fill(255, 255, 0); // 設定圓圈顏色為黃色
  noStroke();
  // 由耳垂位置開始，垂直向下畫出三個圓圈
  for (let i = 0; i < 3; i++) {
    // 讓圓圈往下稍微變小，看起來更自然
    circle(px, py + (i + 1) * 15, 10 - i * 2);
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}