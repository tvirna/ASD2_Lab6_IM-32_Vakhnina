'use strict';

import {findVertexCoord, vector, vectorModule, createDirMatrix, lineVal, calculateAngle, printText} from "./utility.js";
import {weightMatrix} from "./kruskal.js";
const colors = ["red", "blue", "black", "green", "yellow",
    "brown", "#70295a", "orange", "#295b70", "#70294f"]


const drawOnlyVertex = (Coords, i,  ctx, radius, color) => {
    ctx.beginPath();
    ctx.arc(Coords.xCoord[i], Coords.yCoord[i], radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.fillText((i + 1).toString(), Coords.xCoord[i], Coords.yCoord[i]);
    ctx.closePath();
}

const drawStatus = (Coords, i,  ctx, radius, color, status) => {
    ctx.beginPath();
    ctx.arc(Coords.xCoord[i] + radius, Coords.yCoord[i] - radius, radius / 3, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.fillText(status, Coords.xCoord[i] + radius, Coords.yCoord[i] - radius);
    ctx.closePath();
}

const drawVertexes = (ctx, count, x, y, radius, status = '') => {
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < count; i++) {
        const Coords = findVertexCoord(count, x, y);
        status !== '' ? drawStatus(Coords, i, ctx, radius, "black", "н") :
            drawOnlyVertex(Coords, i, ctx, radius);
    }
}

const drawStitch = (Coords, i, ctx, radius, color) => {
    ctx.beginPath();
    ctx.moveTo(Coords.xCoord[i], Coords.yCoord[i]);
    ctx.closePath();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(Coords.xCoord[i] - radius, Coords.yCoord[i] - radius,
        radius, 0, Math.PI / 2, true);
    ctx.stroke();
    ctx.closePath();
}

const drawLine = (Coords, i, j, ctx, radius, angle, color) => {
    const xStart = Coords.xCoord[i] + radius * Math.cos(angle);
    const yStart = Coords.yCoord[i] + radius * Math.sin(angle);
    const xEnd = Coords.xCoord[j] - radius * Math.cos(angle);
    const yEnd = Coords.yCoord[j] - radius * Math.sin(angle);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
    ctx.closePath();
}

const drawEllipse = (Coords, i, j, angle, ctx, radius, color) => {
    const startX = Coords.xCoord[i] + radius * Math.cos(angle);
    const startY = Coords.yCoord[i] + radius * Math.sin(angle);
    const endX = Coords.xCoord[j] - radius * Math.cos(angle);
    const endY = Coords.yCoord[j] - radius * Math.sin(angle);
    const middleX = (startX + endX) / 2;
    const middleY = (startY + endY) / 2;
    const newAngle = Math.atan2((endY - startY), (endX - startX));
    const triangleRadius = vectorModule(vector(startX, startY, endX, endY))
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(startX, startY);
    ctx.ellipse(middleX, middleY, triangleRadius / 2, radius * 2,
        newAngle, Math.PI, 0);

    ctx.stroke();
    ctx.closePath();
    return newAngle;
}

const drawArrows = (angle, xArrow, yArrow, ctx, color, n = 0) => {
    let leftX,
        rightX,
        leftY,
        rightY;
    if (n === 1){
        leftX = xArrow - 15 * Math.cos(angle + 0.5 + Math.PI / 3);
        rightX = xArrow - 15 * Math.cos(angle - 0.5 + Math.PI / 3);
        leftY = yArrow - 15 * Math.sin(angle + 0.5 + Math.PI / 3);
        rightY = yArrow - 15 * Math.sin(angle - 0.5 + Math.PI / 3);
    }
    else {
        leftX = xArrow - 15 * Math.cos(angle + 0.5);
        rightX = xArrow - 15 * Math.cos(angle - 0.5);
        leftY = yArrow - 15 * Math.sin(angle + 0.5);
        rightY = yArrow - 15 * Math.sin(angle - 0.5);
    }
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(xArrow, yArrow);
    ctx.lineTo(leftX, leftY);
    ctx.moveTo(xArrow, yArrow);
    ctx.lineTo(rightX, rightY);
    ctx.stroke();
    ctx.closePath();
}


const arrow = (Coords, j, angle, vertexRadius, ctx, color, n) => {
    const xArrow = Coords.xCoord[j] - vertexRadius * Math.cos(angle);
    const yArrow = Coords.yCoord[j] - vertexRadius * Math.sin(angle);
    drawArrows(angle, xArrow, yArrow, ctx, color, n);
}

const drawGraph = (x, y, n, ctx, radius, count, isUndir = false) => {
    const matrix = createDirMatrix(n, false);
    const Coords = findVertexCoord(count, x, y);
    const w = weightMatrix(matrix)
    drawVertexes(ctx, count, x, y, radius);
    printText(ctx, "Напрямлений граф", Coords.xCoord[0], Coords.yCoord[0] - 50, 30)
    for (let i = 0; i < count; i++) {
        const jPointer = isUndir ? i : count;
        const color = colors[i];
        for (let j = 0; j < jPointer; j++) {
            if (matrix[i][j] === 1) {
                const angle = calculateAngle(Coords, i, j);
                const val = lineVal(Coords, i, j, radius);
                if (i === j) {
                    drawStitch(Coords, i, ctx, radius, color);
                    drawWeight(Coords, i, j, ctx, radius, w, 10, true, color)
                    if(!isUndir) arrow(Coords, j, angle, radius, ctx, color);
                }
                else if (val !== null){
                    drawEllipse(Coords, i, j, angle, ctx, radius, color);
                    drawWeight(Coords, i, j, ctx, radius, w, 10, true, color)
                    if(!isUndir) arrow(Coords, j, angle, radius, ctx, color);
                }
                else {
                    drawLine(Coords, i, j, ctx, radius, angle, color);
                    drawWeight(Coords, i, j, ctx, radius, w, 10, color);
                    if(!isUndir) arrow(Coords, j, angle, radius, ctx, color);
                }
            }
        }
    }
}

const drawWeight = (Coords, start, end, ctx, radius, matrix, size, val = false, color) => {
    const angle = calculateAngle(Coords, start, end);
    const xStart = Coords.xCoord[start] + radius * Math.cos(angle);
    const yStart = Coords.yCoord[start] + radius * Math.sin(angle);
    const endX = Coords.xCoord[end] - radius * Math.cos(angle);
    const endY = Coords.yCoord[end] - radius * Math.sin(angle);
    const x = val ? (xStart + endX) / 2 + radius  : (xStart + endX) / 2 + 5;
    const y = val ? (yStart + endY) / 2 + radius  : (yStart + endY) / 2 + 5;
    printText(ctx, matrix[start][end], x, y, size, color)
}

export {drawVertexes, drawOnlyVertex, vectorModule, vector, arrow,
    drawStitch, drawLine, drawEllipse, drawArrows, findVertexCoord, drawGraph, drawWeight}
