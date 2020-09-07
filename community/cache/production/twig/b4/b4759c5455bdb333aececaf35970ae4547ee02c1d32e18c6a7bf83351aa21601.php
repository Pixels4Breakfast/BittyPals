<?php

/* quickreply_editor.html */
class __TwigTemplate_dc8897d2082ceab454dc65e957403b75be1a28a90fd46b3bdd2569e79efaad21 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        echo "<form method=\"post\" action=\"";
        echo (isset($context["U_QR_ACTION"]) ? $context["U_QR_ACTION"] : null);
        echo "\" id=\"qr_postform\">
";
        // line 2
        // line 3
        echo "\t<div class=\"panel\">
\t\t<div class=\"inner\">
\t\t\t\t<h2 class=\"quickreply-title\">";
        // line 5
        echo $this->env->getExtension('phpbb')->lang("QUICKREPLY");
        echo "</h2>
\t\t\t\t<fieldset class=\"fields1\">
\t\t\t\t";
        // line 7
        // line 8
        echo "\t\t\t\t\t<dl style=\"clear: left;\">
\t\t\t\t\t\t<dt><label for=\"subject\">";
        // line 9
        echo $this->env->getExtension('phpbb')->lang("SUBJECT");
        echo $this->env->getExtension('phpbb')->lang("COLON");
        echo "</label></dt>
\t\t\t\t\t\t<dd><input type=\"text\" name=\"subject\" id=\"subject\" size=\"45\" maxlength=\"124\" tabindex=\"2\" value=\"";
        // line 10
        echo (isset($context["SUBJECT"]) ? $context["SUBJECT"] : null);
        echo "\" class=\"inputbox autowidth\" /></dd>
\t\t\t\t\t</dl>
\t\t\t\t";
        // line 12
        // line 13
        echo "\t\t\t\t<div id=\"message-box\" class=\"message-box\">
\t\t\t\t\t<textarea style=\"height: 9em;\" name=\"message\" rows=\"7\" cols=\"76\" tabindex=\"3\" class=\"inputbox\"></textarea>
\t\t\t\t</div>
\t\t\t\t";
        // line 16
        // line 17
        echo "\t\t\t\t</fieldset>
\t\t\t\t<fieldset class=\"submit-buttons\">
\t\t\t\t\t";
        // line 19
        echo (isset($context["S_FORM_TOKEN"]) ? $context["S_FORM_TOKEN"] : null);
        echo "
\t\t\t\t\t";
        // line 20
        echo (isset($context["QR_HIDDEN_FIELDS"]) ? $context["QR_HIDDEN_FIELDS"] : null);
        echo "
\t\t\t\t\t<input type=\"submit\" accesskey=\"f\" tabindex=\"6\" name=\"preview\" value=\"";
        // line 21
        echo $this->env->getExtension('phpbb')->lang("FULL_EDITOR");
        echo "\" class=\"button2\" id=\"qr_full_editor\" />&nbsp;
\t\t\t\t\t<input type=\"submit\" accesskey=\"s\" tabindex=\"7\" name=\"post\" value=\"";
        // line 22
        echo $this->env->getExtension('phpbb')->lang("SUBMIT");
        echo "\" class=\"button1\" />&nbsp;
\t\t\t\t</fieldset>
\t\t</div>
\t</div>
";
        // line 26
        // line 27
        echo "</form>
";
    }

    public function getTemplateName()
    {
        return "quickreply_editor.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  79 => 27,  78 => 26,  71 => 22,  67 => 21,  63 => 20,  59 => 19,  55 => 17,  54 => 16,  49 => 13,  48 => 12,  43 => 10,  38 => 9,  35 => 8,  34 => 7,  29 => 5,  25 => 3,  24 => 2,  19 => 1,);
    }
}
/* <form method="post" action="{U_QR_ACTION}" id="qr_postform">*/
/* <!-- EVENT quickreply_editor_panel_before -->*/
/* 	<div class="panel">*/
/* 		<div class="inner">*/
/* 				<h2 class="quickreply-title">{L_QUICKREPLY}</h2>*/
/* 				<fieldset class="fields1">*/
/* 				<!-- EVENT quickreply_editor_subject_before -->*/
/* 					<dl style="clear: left;">*/
/* 						<dt><label for="subject">{L_SUBJECT}{L_COLON}</label></dt>*/
/* 						<dd><input type="text" name="subject" id="subject" size="45" maxlength="124" tabindex="2" value="{SUBJECT}" class="inputbox autowidth" /></dd>*/
/* 					</dl>*/
/* 				<!-- EVENT quickreply_editor_message_before -->*/
/* 				<div id="message-box" class="message-box">*/
/* 					<textarea style="height: 9em;" name="message" rows="7" cols="76" tabindex="3" class="inputbox"></textarea>*/
/* 				</div>*/
/* 				<!-- EVENT quickreply_editor_message_after -->*/
/* 				</fieldset>*/
/* 				<fieldset class="submit-buttons">*/
/* 					{S_FORM_TOKEN}*/
/* 					{QR_HIDDEN_FIELDS}*/
/* 					<input type="submit" accesskey="f" tabindex="6" name="preview" value="{L_FULL_EDITOR}" class="button2" id="qr_full_editor" />&nbsp;*/
/* 					<input type="submit" accesskey="s" tabindex="7" name="post" value="{L_SUBMIT}" class="button1" />&nbsp;*/
/* 				</fieldset>*/
/* 		</div>*/
/* 	</div>*/
/* <!-- EVENT quickreply_editor_panel_after -->*/
/* </form>*/
/* */
