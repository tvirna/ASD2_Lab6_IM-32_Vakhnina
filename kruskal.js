'use strict';

import {calculateAngle, createDirMatrix, findVertexCoord, lineVal, undirMatrix} from "./utility.js";
import {arrow, drawEllipse, drawLine, drawOnlyVertex, drawStitch, drawVertexes, drawWeight} from "./draw.js";

const colors = ["red", "blue", "black", "green", "yellow",
    "brown", "#70295a", "orange", "#295b70", "#70294f"];

class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    add(data) {
        const newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        this.size++;
    }
}

const weightMatrix = (matrix) => {
    const { length } = matrix;
    const mat = undirMatrix(matrix);
    const b = createDirMatrix(3105, true);
    const cTemp = Array.from({ length }, () => Array(length).fill(0));
    const c = cTemp.map((value, index) => value.map(
        (value2, index2) => Math.ceil(100 * b[index][index2] * mat[index][index2])
    ));
    const dTemp = Array.from({ length }, () => Array(length).fill(0));
    const d = dTemp.map((value, index) => value.map(
        (value2, index2) => c[index][index2] === 0 ? 0 : 1)
    );
    const hTemp = Array.from({ length }, () => Array(length).fill(0));
    const h = hTemp.map((value, index) => value.map(
        (value2, index2) => d[index][index2] !== d[index2][index] ? 1 : 0)
    );
    const tr = Array.from({ length }, () => Array(length).fill(0));
    for (let i = 0; i < length; i++){
        for (let j = i; j < length; j++){
             tr[i][j] = 1;
        }
    }
    const w = Array.from({ length }, () => Array(length).fill(0));
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < i; j++) {
            w[i][j] = w[j][i] = (d[i][j] + h[i][j] * tr[i][j]) * c[i][j];
        }
    }
    return w;
}

const sort = (matrix) => {
    const { length } = matrix;
    const mat = matrix.map((value) => value.map(Math.round));
    const result = Array.from({ length }, () => [])
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
            if (matrix[i][j] !== 0 && matrix[i][j] !== Infinity) {
                result[i].push([j, mat[i][j]]);
            }
        }
    }
    for (const row of result) {
        row.sort(([, k1], [, k2]) => k1 - k2);
    }
    return result;
};

class DisjointSet {
    constructor(size) {
        this.parent = Array.from({length: size}, (_, i) => i);
        this.rank = new Array(size).fill(0);
    }

    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]); // Path compression
        }
        return this.parent[x];
    }

    union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);

        if (rootX === rootY) return; // Already in the same set

        // Union by rank
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
    }
}

const kruskal = (matrix) => {
    const weight = weightMatrix(matrix);
    const { length } = matrix;
    const edges = [];

    for (let i = 0; i < length; i++) {
        for (let j = i + 1; j < length; j++) {
            if (weight[i][j] !== 0 && weight[i][j] !== Infinity) {
                edges.push([i, j, weight[i][j]]); 
            }
        }
    }
    
    edges.sort((a, b) => a[2] - b[2]); // Sort edges by weight in ascending order

    const result = new LinkedList();
    const ds = new DisjointSet(length);

    let totalSum = 0;
    for (const [u, v, w] of edges) {
        if (ds.find(u) !== ds.find(v)) { // Check for cycles
            result.add([u, v]);
            ds.union(u, v);
            totalSum += w;
        }
    }

    return { result, totalSum };
};

const drawKruskal = (matrix, x, y, ctx, count, radius, clickQueue, button) => {
    const w = weightMatrix(matrix);
    const coords = findVertexCoord(matrix.length, x, y);
    const array = kruskal(matrix, 0);
    console.log('Adjacency matrix of the graph');
    console.table(matrix);
    console.log('Weighted matrix of the graph');
    console.table(w);
    console.log('Total sum in result of tracing this graph: ' + array.totalSum);
    let pointer = 0;
    console.log('The list of graph edges:');
    drawVertexes(ctx, count, x, y, radius);
    let current = array.result.head;
    while(current !== null){
        const start = current.data[0];
        const end = current.data[1];
        const angle = calculateAngle(coords, start, end);
        const val = lineVal(coords, start, end, radius);
        const color = colors[pointer];
        console.log((start + 1) + ' -> ' + (end + 1));
        if (start === end) {
            clickQueue.enqueue(() => {
                drawStitch(coords, start, ctx, radius, color);
                drawOnlyVertex(coords, start, ctx, radius, color);
                drawOnlyVertex(coords, end, ctx, radius, color);
                arrow(coords, end, angle, radius, ctx, color);
                drawWeight(coords, start, end, ctx, radius, w, 10, true, color);
            })
        }
        else if (val !== null){
            clickQueue.enqueue(() => {
                drawEllipse(coords, start, end, angle, ctx, radius, color);
                drawOnlyVertex(coords, start, ctx, radius, color);
                drawOnlyVertex(coords, end, ctx, radius,color);
                arrow(coords, end, angle, radius, ctx, color, 1);
                drawWeight(coords, start, end, ctx, radius, w, 10, true, color);
            })

        }
        else{
            clickQueue.enqueue(() => {
                drawLine(coords, start, end, ctx, radius, angle, color);
                drawOnlyVertex(coords, start, ctx, radius, color);
                drawOnlyVertex(coords, end, ctx, radius, color);
                arrow(coords, end, angle, radius, ctx, color);
                drawWeight(coords, start, end, ctx, radius, w, 10, true, color);
            })

        }
        pointer++;
        current = current.next;
    }
    button.addEventListener("click", clickQueue.next);
    
};

export { weightMatrix, drawKruskal, kruskal }; 
