<script>
    		var coleccinDeEntorno = document.getElementById("coleccinDeEntorno");
    		if(coleccinDeEntorno) {
      			coleccinDeEntorno.addEventListener("click", function (e) {
        				// Add your code here
      			});
    		}
    		
    		var memoriasText = document.getElementById("memoriasText");
    		if(memoriasText) {
      			memoriasText.addEventListener("click", function (e) {
        				// Add your code here
      			});
    		}
    		
    		var formarLaPalabra = document.getElementById("formarLaPalabra");
    		if(formarLaPalabra) {
      			formarLaPalabra.addEventListener("click", function (e) {
        				// Add your code here
      			});
    		}
    		
    		var deDondeVenimos = document.getElementById("deDondeVenimos");
    		if(deDondeVenimos) {
      			deDondeVenimos.addEventListener("click", function () {
        				var popup = document.getElementById("frameContainer");
        				if(!popup) return;
        				var popupStyle = popup.style;
        				if(popupStyle) {
          					popupStyle.display = "flex";
          					popupStyle.zIndex = 100;
          					popupStyle.backgroundColor = "rgba(113, 113, 113, 0.3)";
          					popupStyle.alignItems = "flex-start";
          					popupStyle.justifyContent = "flex-end";
        				}
        				popup.setAttribute("closable", "");
        				
        				var onClick = popup.onClick || function(e) {
          					if(e.target === popup && popup.hasAttribute("closable")) {
            						popupStyle.display = "none";
          					}
        				};
        				popup.addEventListener("click", onClick);
      			});
    		}
    		
    		var ellipse = document.getElementById("ellipse");
    		if(ellipse) {
      			ellipse.addEventListener("click", function () {
        				var popup = document.getElementById("frameContainer");
        				if(!popup) return;
        				var popupStyle = popup.style;
        				if(popupStyle) {
          					popupStyle.display = "flex";
          					popupStyle.zIndex = 100;
          					popupStyle.backgroundColor = "rgba(113, 113, 113, 0.3)";
          					popupStyle.alignItems = "flex-start";
          					popupStyle.justifyContent = "flex-end";
        				}
        				popup.setAttribute("closable", "");
        				
        				var onClick = popup.onClick || function(e) {
          					if(e.target === popup && popup.hasAttribute("closable")) {
            						popupStyle.display = "none";
          					}
        				};
        				popup.addEventListener("click", onClick);
      			});
    		}</script>
        
      </body >
</html>