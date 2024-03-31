import Scene from "../canvas/Scene"
import moment from 'moment-timezone';

const drawLine = (context, x, y, length, angle) => {
    context.save()
    context.beginPath()

    // offset + rotate
    context.translate(x, y)
    context.rotate(angle) // ! radian

    // draw line
    context.moveTo(0, 0)
    context.lineTo(0, -length)
    context.stroke()

    context.closePath()
    context.restore()
}

export default class Scenario extends Scene {
    constructor(id) {
        super(id)

       // debug
        this.params['line-width'] = 2
        this.params.timezone = "Europe/Paris"
        this.params.fontSize = 30;
        this.params.fontName = 'Arial';
        this.params.centerY = this.height / 2 - 180;
        this.params.color = "#ffffff"
        this.params.flagColor = "#ffffff";

        if (this.debug.active) {
           this.debugFolder.add(this.params, 'line-width', 1, 10).onChange(() => this.drawUpdate())
           this.debugFolder.add(this.params, 'timezone', { France: 'Europe/Paris', USA: 'America/New_York', China: 'Asia/Shanghai', Japon: "Asia/Tokyo" }).onChange(() => this.drawUpdate())
           this.debugFolder.add(this.params, 'fontSize', 20, 100).onChange(() => this.drawUpdate())
           this.debugFolder.add(this.params, 'fontName', ['Arial', 'Verdana', 'Times New Roman']).onChange(() => this.drawUpdate())
           this.debugFolder.add(this.params, 'centerY', 0, this.height).onChange(() => this.drawUpdate())
           this.debugFolder.addColor(this.params, 'color').onChange(() => this.drawUpdate())
           this.debugFolder.addColor(this.params, 'flagColor').onChange(() => this.drawUpdate())
        }
    }

    update() {
        if (!super.update()) return
        this.drawUpdate()
    }

    drawUpdate() {
        this.clear()

        this.context.lineCap = 'round'
        this.context.strokeStyle = this.params.color
        this.context.lineWidth = this.params['line-width']

        this.drawClockOutline()
        this.drawClockMarks()
        this.drawClock()
        this.drawTimeZoneIndicator()
        this.drawCountryInitials()
    }

    drawClockOutline() {
        this.context.beginPath()
        this.context.arc(this.width / 2, this.height / 2, this.width / 2, 0, 2 * Math.PI)
        this.context.stroke()
    }

    drawClockMarks() {
        for (let i = 0; i < 60; i++) {
            let angle = (2 * Math.PI / 60) * i;
            let length = i % 5 === 0 ? 20 : 10;
            let startDistance = this.width / 2 - length;
            let endDistance = this.width / 2;
    
            let startX = this.width / 2 + startDistance * Math.cos(angle);
            let startY = this.height / 2 + startDistance * Math.sin(angle);
            let endX = this.width / 2 + endDistance * Math.cos(angle);
            let endY = this.height / 2 + endDistance * Math.sin(angle);
    
            this.context.beginPath();
            this.context.moveTo(startX, startY);
            this.context.lineTo(endX, endY);
            this.context.stroke();
        }
    }

    drawClock() {
        const radius = this.width / 2;
    
        const now = moment().tz(this.params.timezone);
    
        let hour = now.hours();
        hour %= 12;
        let hourAngle = (2 * Math.PI / 12) * (hour + now.minutes() / 60);
        drawLine(this.context, this.width / 2, this.height / 2, radius * 0.5, hourAngle);
    
        let minute = now.minutes();
        let minuteAngle = (2 * Math.PI / 60) * minute;
        drawLine(this.context, this.width / 2, this.height / 2, radius * 0.8, minuteAngle);
    
        let second = now.seconds();
        let secondAngle = (2 * Math.PI / 60) * second;
        drawLine(this.context, this.width / 2, this.height / 2, radius * 0.9, secondAngle);
    }
    drawCountryInitials() {
        const initials = {
            'Europe/Paris': 'FR',
            'America/New_York': 'USA',
            'Asia/Shanghai': 'CH',
            'Asia/Tokyo': 'JP'
        };
    
        const centerX = this.width / 2;
        const centerY = this.height / 2 - 60;
    
        this.context.font = `${this.params.fontSize}px ${this.params.fontName}`;
        this.context.textAlign = 'center';
        this.context.fillStyle = this.params.flagColor;
        this.context.fillText(initials[this.params.timezone], centerX, centerY);
    }
    drawTimeZoneIndicator() {
        const centerX = this.width / 2;
        const centerY = this.params.centerY;

        const now = moment().tz(this.params.timezone);
        const hours = now.hours();
        const isPM = hours >= 12;
    
        this.context.beginPath();
        if (isPM) {
            const moonRadius = 18;
    
            this.context.fillStyle = 'yellow';
            this.context.arc(centerX, centerY, moonRadius+6, 0, 2 * Math.PI);
            this.context.fill();

            this.context.beginPath();
            this.context.fillStyle = '#b8b8b8';
            this.context.arc(centerX + moonRadius / 3, centerY - 4, moonRadius + 5, 0, 2 * Math.PI);
            this.context.fill();
        } else {
            this.context.arc(centerX, centerY, 10, 0, 2 * Math.PI);
            for (let i = 0; i < 12; i++) {
                const angle = Math.PI / 6 * i;
                const lineLength = 15;
                const startX = centerX + Math.cos(angle) * 10;
                const startY = centerY + Math.sin(angle) * 10;
                const endX = centerX + Math.cos(angle) * (10 + lineLength);
                const endY = centerY + Math.sin(angle) * (10 + lineLength);
                this.context.moveTo(startX, startY);
                this.context.lineTo(endX, endY);
            }
            this.context.stroke();
        }
    }
}