<script>
    export let points;
    export let totalAsked;
    let procent = 0;

    export function setProcent(points,totalAsked){
        // console.log('GetProcent now called');
        // console.log('totalAsked: %d', totalAsked);
        if (totalAsked == 0){
            procent = 0;
        }
        else{
            procent = Math.round(points / totalAsked * 100)
        }
    }

</script>

<style>
    .Points {
        position: relative;
        right: 0px;
        top: 0px;
        color: green;
    }

</style>

<div class = 'Points'>
    <h3>Score: {points} out of {totalAsked} = {procent} %</h3>
</div>