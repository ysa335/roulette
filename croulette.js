/**
 * Copyright (C) yasushi SAITO
 *      2025/09/28 created;
 */

const kFULL_TURN_DEG = 360.0;
const kTWO_PI = Math.PI * 2;

class Croulette {
    /**
        * @param {HTMLCanvasElement} aCanvasId
        * @param {object} [opts]
        * @param {number} [opts.segmentCount=10]        - スライス数
        * @param {number} [opts.speed=10]               - 回転スピード
        * @param {string} [opts.evenColor="#f7f7f7"]    - 偶数スライス色
        * @param {string} [opts.oddColor="#e0e0e0"]     - 奇数スライス色
        * @param {string} [opts.digitColor="#00f"]      - 文字盤の文字色
        * @param {number} [opts.offset=0]               - 描画オフセット（y）
        * @param {boolean} [opts.debug=false]           - デバッグ描画
     **/
    constructor( aCanvasId, opts = {}) {

        this.canvas = document.getElementById( aCanvasId );
        this.ctx    = this.canvas.getContext("2d");
        // オプション
        this.maxSegment = Math.max(1, opts.segmentCount ?? 10);
        this.evenColor = opts.evenColor ?? "#ff0000";
        this.oddColor  = opts.oddColor  ?? "#000000";
        this.offset    = opts.offset ?? 20;
        this.speed     = opts.speed ?? 10; // 1-30 が妥当。animation 用 初期速度（度/フレーム）
        this.debug     = !!opts.debug;

        this.segmentDegree = kFULL_TURN_DEG / this.maxSegment; // section 分割度数
        this.segmentCenter = this.segmentDegree / 2;  // 数字の center 位置
        // 最初のルーレットの数字を真上に移動させるための 回転 radian
        this.angleR = this._toRadian(270.0 - this.segmentCenter); // 現在の回転角度（ラジアン）
        this.angle  = 0; /** 現在の角度 */
        this.angleInDegrees  = 0;
        this.targetRotation  = 0; // 最終的な回転角度（度）
        //
        this.animating = false;
        this.spining   = false;
        //
        this.onFinish  = null;
        this.onSpining = null;

        this.arrowColor = opts.arrowColor ?? '#00ff00';

        this.digitColor  = opts.digitColor  ?? 'white';
        this.digitColor2 = opts.digitColor2 ?? 'white'; // くくる色

        this.debug = false;
    }

    /**
     * 上のポインター表示
     */
    drawPointer() {
        const ctx = this.ctx;
        const theOffset = 10;
        /* down triangle */
        let theY1 = 5; /* START Y */
        let theY2 = 18; /* END Y */
        let theX1 = this.canvas.width / 2 - theOffset;
        let theX2 = this.canvas.width / 2 + theOffset;

        ctx.beginPath();
        ctx.moveTo( theX1, theY1 );
        ctx.lineTo( theX2, theY1 );
        ctx.lineTo( this.canvas.width / 2, theY2);
        ctx.closePath();
        ctx.fillStyle = this.arrowColor;
        ctx.fill();
    }

    /**
     * ルーレットの描画
     */
    draw() {
        const ctx = this.ctx;
        const radius = this.canvas.width / 2 -this.offset; // 円の半径を canvas 幅の半分とする
        ctx.clearRect(0, this.offset, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.translate(radius + this.offset, radius + (this.offset *1.2));
        ctx.rotate( this.angleR );

        for (let i = 0; i < this.maxSegment; i++) {
            const angleR = ( kTWO_PI / this.maxSegment) * i;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.fillStyle = i % 2 === 0 ? this.evenColor : this.oddColor;
            ctx.arc(0, 0, radius, angleR, angleR + kTWO_PI / this.maxSegment);
            ctx.fill();
            ctx.stroke();

            ctx.save();
            /** 文字の方向を常に上に */
            ctx.rotate(angleR + Math.PI / this.maxSegment );
            ctx.translate(radius - this.offset, 0);
            let theRotateRadius = -this.angleR - angleR - ( Math.PI / this.maxSegment );
            ctx.rotate( theRotateRadius );
            // 文字盤の数字の色
            ctx.fillStyle = this.digitColor;
            ctx.font = "24px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(i + 1, 0, 0);
            ctx.strokeStyle = this.digitColor2;
            ctx.strokeText(i + 1, 0, 0);
            ctx.restore();
        }
        ctx.restore();
    }

    /**
     * リセット
     */
    reset() {
        if ( this.debug ) { console.log('enter reest'); }

        this.animating = false;

        this.angleR = this._toRadian(270.0 - this.segmentCenter);// 現在の回転角度（ラジアン）
        this.targetRotation = 0; // 最終的な回転角度（度）

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.draw();
        this.drawPointer();
    }

    /**
     *
     * @param aNumber : ルーレットの番号
     * @param aNTimes : 0 - n , 360度回転させる数
     */
    rotateToNumber( aNumber, aNTimes = 2 ) {
        if ( this.debug ) { console.log('enter rotateToNumber 1 / spining:' + this.spining); }
        if ( ! this.spining ) { this.spining = true; }

        if ( aNumber < 1) {
            $("#message").text( '指定したルーレットの番号がマイナスです。処理を中断します。');
            return;
        }
        if ( this.maxSegment < aNumber ) {
            $("#message").text( '指定したルーレットの番号が分割されているスライス数を超えています。処理を中断します。');
            return;
        }

        let theN = (( this.maxSegment - aNumber ) + 1 ) % this.maxSegment;
        let theD = ( kFULL_TURN_DEG * aNTimes ) + ( this.segmentDegree * theN );
        this._rotateByDegree( theD );
    }

    /**
     * startSpin() は、開始ボタン用
     */
    startSpin() {
        this.reset();
        this.spining = true;
        // startSpin の最大は、100周
        this.rotateToNumber(this.maxSegment, 100);
    }

    /**
     * stopSpin() は、停止ボタン用
     */
    stopSpin() {
        /** stop が押された時の segment no を取得 */
        if ( this.debug ) {
            console.log('enter stop angleInDegrees:' + this.angleInDegrees);
        }

        let theR = this._getCurrentInfo();
        let theN = theR.number;
        if ( this.debug) { console.log('Stop Number:' + theN); }

        this.spining = false;
        this.animating = false;

        if (typeof this.onFinish === 'function') {
            this.onFinish( theN );
        }
    }

    setOnFinish(aCallback) {
        this.onFinish = aCallback;
    }

    setOnSpining(aCallback) {
        this.onSpining = aCallback;
    }

    /**
     * 現在の角度から、ルーレットの番号と角度を返す。
     * @returns {{number: number, angle: number}}
     * @private
     */
    _getCurrentInfo() {
        let theN = Math.trunc(((kFULL_TURN_DEG - (this.angleInDegrees - this.segmentCenter)) / this.segmentDegree ) + 1) % this.maxSegment;
        if ( theN === 0 ) {　theN = this.maxSegment; }
        return( {number:theN, angle: this.angleInDegrees });
    }

    /**
     * 指定した角度でルーレットを回す
     * @param aDegree
     * @private
     */
    _rotateByDegree( aDegree = kFULL_TURN_DEG ) {
        if (this.animating) return;

        if ( this.debug ) { console.log('enter _rotateByDegree' ); }

        this.targetRotation = aDegree;

        this.animating = true;
        let angleInDegrees = 0;
        let currentSpeed = this.speed;
        const deceleration = 0.0001;

        const animate = () => {

            if ( this.spining ) {
                if (angleInDegrees <= (this.targetRotation - currentSpeed)) {
                    angleInDegrees += currentSpeed;
                    /** 360 度以内に変換 */
                    this.angleInDegrees = angleInDegrees % kFULL_TURN_DEG;
                    currentSpeed -= deceleration;
                    this.angleR += this._toRadian(currentSpeed);
                    this.angle = currentSpeed;

                    if (this.debug) {
                        console.log('rotateByDigree angle:' + this.angle + ' degree:' + this.angleInDegrees + ' spining:' + this.spining);
                    }

                    if (currentSpeed < 1.0) {
                        currentSpeed = 1;
                        angleInDegrees = this.targetRotation;
                    }

                    if (this.debug) {
                        console.log('cspeed:' + currentSpeed + ' targetRotation:' + this.targetRotation + ' angleInDegrees:' + angleInDegrees);
                    }

                    /** 回転に余りがある場合、差分を補正 */
                    let theDiff = this.targetRotation - angleInDegrees;
                    if (theDiff < currentSpeed) {
                        this.angleR += this._toRadian(theDiff);
                        this.angleInDegrees = (this.angleInDegrees + theDiff) % kFULL_TURN_DEG;
                        angleInDegrees = this.targetRotation;
                    }

                    this.draw();
                    requestAnimationFrame(animate);

                    /** 描画中の値を知りたい関数がある場合 */
                    if (typeof this.onSpining === 'function') {
                        let theR = this._getCurrentInfo();
                        this.onSpining( theR );
                    }

                } else {
                    /** 回転終了 */
                    currentSpeed = 0;
                    angleInDegrees = this.targetRotation;

                    /** 止まった番号を計算 */
                    const sectionAngle = kFULL_TURN_DEG / this.maxSegment;
                    const offsetAngle = this.targetRotation % kFULL_TURN_DEG;
                    const resultIndex = (kFULL_TURN_DEG - offsetAngle + sectionAngle / 2) % kFULL_TURN_DEG;
                    const finalIndex = Math.floor(resultIndex / sectionAngle);
                    const result = ((finalIndex + this.maxSegment) % this.maxSegment) + 1;

                    this.drawPointer();

                    if (typeof this.onFinish === 'function') {
                        this.animating = false;
                        this.onFinish(result);
                    }
                }
            }
        };
        animate();
    }

    /** degree to radian */
    _toRadian( aDegree ) {
        return ( aDegree * Math.PI / 180);
    }
}
