//此处展开结界
!function (setting_w, setting_h) {
    //Set the canvas
    const cvs = document.getElementById("canvas_2");
    const ctx = cvs.getContext("2d");

    //定义大的宽和高以及每个格子的大小
    // var cvs_w = cvs.style.width.split("px")[0]*1,
    //     cvs_h = cvs.style.height.split("px")[0]*1,
    var cvs_w = cvs.width,
        cvs_h = cvs.height,
        w = cvs_w / setting_w,
        h = cvs_h / setting_h;

    function DrawBox(x, y, w, h) {
        //相邻格子分配深浅两种颜色
        let b = (x + y) % 2 == 0 ? theme.color(0) : theme.color(1);
        ctx.fillStyle = b;
        ctx.fillRect(x * w, y * h, w, h);
    }

    //画出每个格子
    for (let i = 0; i < setting_w; i++) {
        for (let j = 0; j < setting_h; j++) {
            DrawBox(i, j, w, h);
        }
    }

    //刷上背景油漆
    document.getElementById("body").style.backgroundColor = theme.color(2);
    //修改边框的颜色
    document.getElementById("canvas_2").style.border = theme.color(3)+" solid 30px";
}(setting.width, setting.height)