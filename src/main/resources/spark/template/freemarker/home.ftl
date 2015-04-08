<#assign content>
<h1>maps.</h1>
<canvas id="map" width="600" height="600"></canvas>
<div class="map_controls">
	<button id="home_view">H</button>
	<button id="zoom_in">+</button>
	<button id="zoom_out">-</button>
</div>
<form method="POST" action="/results" id="maps_form">
	<img src="images/maps_start_icon.png" alt="Start" class="searchImage">
	<input class="text_box" id="text_box1" type="text" name="text1" placeholder="Start 1">
    </input>
    
    <input class="text_box" id="text_box2" type="text" name="text2" placeholder="Start 2">
    </input>
    
    <div class="suggDiv" id="suggDiv1">
    	<ul class="suggestions" id="suggestions1">
        </ul>
    </div>
    
    <div class="suggDiv" id="suggDiv2">
    	<ul class="suggestions" id="suggestions2">
        </ul>
    </div>

	<br>

	<img src="images/maps_goal_icon.png" alt="Goal" class="searchImage">
    <input class="text_box" id="text_box3" type="text" name="text3" placeholder="Goal 1">
    </input>
    
    <input class="text_box" id="text_box4" type="text" name="text4" placeholder="Goal 2">
    </input>
    
    <div class="suggDiv" id="suggDiv3">
    	<ul class="suggestions" id="suggestions3">
        </ul>
    </div>
    
    <div class="suggDiv" id="suggDiv4">
        <ul class="suggestions" id="suggestions4">
        </ul>
    </div>

    <input id="search_button" type="submit" value="Search">
</form>
</#assign>
<#include "main.ftl">
