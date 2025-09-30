<?php
  $max = 12;
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>croulette.js sample</title>

<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
  rel="stylesheet"
  integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
  crossorigin="anonymous"
/>

<script
  src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
  integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
  crossorigin="anonymous"
></script>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<script src="croulette.min.js"></script>

<script>

function fEnableBtns() {
    const kBtns = document.querySelectorAll('.sectionbtn');
    kBtns.forEach( function( one ) {
        if ( $(one).hasClass('disabled')) { $(one).removeClass('disabled'); }
    });
}
function fDisableBtns() {
    const kBtns = document.querySelectorAll('.sectionbtn');
    kBtns.forEach( function( one ) {
        if ( ! $(one).hasClass('disabled')) { $(one).addClass('disabled'); }
    });
}


$(document).ready(function () {
    const cRoulette = new Croulette( 'rouletteCanvas', { segmentCount:<?php echo $max ?> , speed:15 });

    cRoulette.draw();
    cRoulette.drawPointer();

    $("#start").on('click', function(aEv) {
        aEv.preventDefault();

        if ( ! $(this).hasClass('disabled'))  { $(this).addClass('disabled');}
        if ( $("#stop").hasClass('disabled')) { $("#stop").removeClass('disabled');}

	fDisableBtns();
	$("#message").text(`回転中です。[STOP]ボタンを押してください。`);

        cRoulette.setOnSpining( result => {

            let theNumber = `${result.number}`;

            let theNum = Number(`${result.angle}`).toFixed(2);
            let theAngle = parseFloat( theNum );

            console.log('onSpining N:'+ theNumber + ' angle:' + theAngle);
            $("#rnumber").text( theNumber);
            $("#rangle").text( theAngle );
        });

	cRoulette.setOnFinish(result => {
            $("#message").text(`Timeout して${result} 番で 停止しました。`);
	    if ($("#start").hasClass('disabled')) { $("#start").removeClass('disabled');}
            if (!$("#stop").hasClass('disabled')) { $("#stop").addClass('disabled');}
    	    fEnableBtns();
        });

        cRoulette.startSpin();
    });

    $("#reset").on('click', function(aEv) {
        aEv.preventDefault();

        cRoulette.spining = false;
        cRoulette.reset();
        $("#rnumber").text( 1 );
        $("#rangle").text( 0.0 );
        $("#message").text(`ルーレットをスタート位置へ戻しました。`);

        if ($("#start").hasClass('disabled')) { $("#start").removeClass('disabled');}
        if (!$("#stop").hasClass('disabled')) { $("#stop").addClass('disabled');}
	fEnableBtns();
    });

    $("#stop").on('click', function(aEv) {
        aEv.preventDefault();

        cRoulette.setOnFinish(result => {
	    $("#message").text(`[STOP]で止まったのは${result} 番です。`);
        });
        cRoulette.stopSpin();

        if ($("#start").hasClass('disabled')) { $("#start").removeClass('disabled');}
        if (!$("#stop").hasClass('disabled')) { $("#stop").addClass('disabled');}
	fEnableBtns();	
    });

    $("button.sectionbtn").on('click', function(aEv) {
        aEv.preventDefault();
        let theNumber = $(this).data('num');
	$("#message").text('停止番号' + theNumber +'で、回転中です。');

        const kBtns = document.querySelectorAll('.sectionbtn');
  	fDisableBtns();
        if( ! $("#start").hasClass('disabled')) { $("#start").addClass('disabled');}

        cRoulette.setOnFinish(result => {
            $("#message").text(`止まったのは ${result} 番！`);
    	    fEnableBtns();
            if( $("#start").hasClass('disabled')) { $("#start").removeClass('disabled');}
        });
        cRoulette.reset();
        cRoulette.rotateToNumber( theNumber, 2 );
    });
});
</script>
</head>

<body>

<div id="main" style="padding:10px">

    <h3>sample program</h3>


    <div id="roulette_div">
        <p>
            message:<span id="message"></span><br>
            roulette number:<span id="rnumber">1</span>&nbsp;angle:<span id="rangle">0.0</span>
        </p>
        <canvas id="rouletteCanvas" width="300" height="300" style="margin-left:10px;border:1px solid green;background-color:green"></canvas>
        <div id="roulettBtns" style="margin-left:10px">
	  <p>
            <button id="start" class="btn btn-sm btn-primary">START</button>
            <button id="reset" class="btn btn-sm btn-danger">RESET</button>
            <button id="stop" class="btn btn-sm btn-primary disabled">STOP</button>
          </p>
        <?php  for( $i = -1 ; $i < $max + 1 ; $i ++) {
	       $num = $i + 1;
	?>
                <button id="sectionbtn-<?php echo $num ?>"
                  class="sectionbtn btn btn-sm btn-primary" data-num="<?php echo $num ?>"><?php echo $num ?></button>
        <?php }	?>
        </div>

    </div>

</div>

</body>
</html>

