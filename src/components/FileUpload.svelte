<script>
  import { navigate } from "svelte-routing";
  import { obraContent, bancoContent } from "../stores.js";

  let obraFile;
  let bancoFile;

  function handleFileUpload(event, fileType) {
    if (fileType === 'obra') {
      obraFile = event.target.files[0];
    } else if (fileType === 'banco') {
      bancoFile = event.target.files[0];
    }
  }

  function handleSubmit() {
    if (obraFile && bancoFile) {
      const obraReader = new FileReader();
      const bancoReader = new FileReader();

      obraReader.onload = (e) => {
        $obraContent = e.target.result;
        if ($bancoContent) {
          navigate("/results");
        }
      };

      bancoReader.onload = (e) => {
        $bancoContent = e.target.result;
        if ($obraContent) {
          navigate("/results");
        }
      };

      obraReader.readAsText(obraFile, "ISO-8859-1");
      bancoReader.readAsText(bancoFile, "ISO-8859-1");
    }
  }
</script>

<!-- Rest of the component remains the same -->