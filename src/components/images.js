import bb from './assets/b_b.png';
import bw from './assets/b_w.png';
import kb from './assets/k_b.png';
import kw from './assets/k_w.png';
import nb from './assets/n_b.png';
import nw from './assets/n_w.png';
import pb from './assets/p_b.png';
import pw from './assets/p_w.png';
import qb from './assets/q_b.png';
import qw from './assets/q_w.png';
import rb from './assets/r_b.png';
import rw from './assets/r_w.png';

export function retimages(type, color) {
    var t = type + color;
    var result = pb;
    switch (t) {
        case "bb": result = bb; break;
        case "bw": result = bw; break;
        case "kb": result = kb; break;
        case "kw": result = kw; break;
        case "nb": result = nb; break;
        case "nw": result = nw; break;
        case "pb": result = pb; break;
        case "pw": result = pw; break;
        case "qb": result = qb; break;
        case "qw": result = qw; break;
        case "rb": result = rb; break;
        case "rw": result = rw; break;
    }
    return result;
}
