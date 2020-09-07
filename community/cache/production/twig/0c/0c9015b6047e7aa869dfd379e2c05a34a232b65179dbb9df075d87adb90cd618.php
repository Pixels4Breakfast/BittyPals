<?php

/* ucp_pm_message_footer.html */
class __TwigTemplate_bf727a9e8da460b2e15ff71221b32119f5a87488e2d459b4aa44775e8b98d78b extends Twig_Template
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
        echo "<div>";
        echo (isset($context["S_FORM_TOKEN"]) ? $context["S_FORM_TOKEN"] : null);
        echo "</div>
</form>
";
    }

    public function getTemplateName()
    {
        return "ucp_pm_message_footer.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  19 => 1,);
    }
}
/* <div>{S_FORM_TOKEN}</div>*/
/* </form>*/
/* */
