<?php

/* posting_review.html */
class __TwigTemplate_18613a89c3e52a10a6c06d705e758d2b8ada3d3008b5b5b9f265b0a9cb547c53 extends Twig_Template
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
        echo "<h3>";
        echo $this->env->getExtension('phpbb')->lang("POST_REVIEW");
        echo "</h3>

<p>";
        // line 3
        echo $this->env->getExtension('phpbb')->lang("POST_REVIEW_EXPLAIN");
        echo "</p>

";
        // line 5
        $context['_parent'] = $context;
        $context['_seq'] = twig_ensure_traversable($this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "post_review_row", array()));
        foreach ($context['_seq'] as $context["_key"] => $context["post_review_row"]) {
            // line 6
            if ($this->getAttribute($context["post_review_row"], "S_IGNORE_POST", array())) {
                // line 7
                echo "<div class=\"post bg3 post-ignore\">
\t<div class=\"inner\">
\t\t";
                // line 9
                echo $this->getAttribute($context["post_review_row"], "L_IGNORE_POST", array());
                echo "
";
            } else {
                // line 11
                echo "<div class=\"post ";
                if (($this->getAttribute($context["post_review_row"], "S_ROW_COUNT", array()) % 2 == 1)) {
                    echo "bg1";
                } else {
                    echo "bg2";
                }
                echo "\">
\t<div class=\"inner\">
";
            }
            // line 14
            echo "
\t<div class=\"postbody\" id=\"ppr";
            // line 15
            echo $this->getAttribute($context["post_review_row"], "POST_ID", array());
            echo "\">
\t\t<h3><a href=\"#ppr";
            // line 16
            echo $this->getAttribute($context["post_review_row"], "POST_ID", array());
            echo "\">";
            echo $this->getAttribute($context["post_review_row"], "POST_SUBJECT", array());
            echo "</a></h3>
\t\t<p class=\"author\">
\t\t\t";
            // line 18
            if ((isset($context["S_IS_BOT"]) ? $context["S_IS_BOT"] : null)) {
                // line 19
                echo "\t\t\t\t<span><i class=\"icon fa-file fa-fw icon-lightgray icon-md\" aria-hidden=\"true\"></i><span class=\"sr-only\">";
                echo $this->getAttribute($context["post_review_row"], "MINI_POST", array());
                echo "</span></span>
\t\t\t";
            } else {
                // line 21
                echo "\t\t\t\t<a href=\"";
                echo $this->getAttribute($context["post_review_row"], "U_MINI_POST", array());
                echo "\" title=\"";
                echo $this->getAttribute($context["post_review_row"], "MINI_POST", array());
                echo "\">
\t\t\t\t\t<i class=\"icon fa-file fa-fw icon-lightgray icon-md\" aria-hidden=\"true\"></i><span class=\"sr-only\">";
                // line 22
                echo $this->getAttribute($context["post_review_row"], "MINI_POST", array());
                echo "</span>
\t\t\t\t</a>
\t\t\t";
            }
            // line 25
            echo "\t\t\t";
            echo $this->env->getExtension('phpbb')->lang("POST_BY_AUTHOR");
            echo "<strong>  ";
            echo $this->getAttribute($context["post_review_row"], "POST_AUTHOR_FULL", array());
            echo "</strong> &raquo; ";
            echo $this->getAttribute($context["post_review_row"], "POST_DATE", array());
            echo "
\t\t</p>
\t\t<div class=\"content\">";
            // line 27
            echo $this->getAttribute($context["post_review_row"], "MESSAGE", array());
            echo "</div>

\t\t";
            // line 29
            if ($this->getAttribute($context["post_review_row"], "S_HAS_ATTACHMENTS", array())) {
                // line 30
                echo "\t\t\t<dl class=\"attachbox\">
\t\t\t\t<dt>";
                // line 31
                echo $this->env->getExtension('phpbb')->lang("ATTACHMENTS");
                echo "</dt>
\t\t\t\t";
                // line 32
                $context['_parent'] = $context;
                $context['_seq'] = twig_ensure_traversable($this->getAttribute($context["post_review_row"], "attachment", array()));
                foreach ($context['_seq'] as $context["_key"] => $context["attachment"]) {
                    // line 33
                    echo "\t\t\t\t\t<dd>";
                    echo $this->getAttribute($context["attachment"], "DISPLAY_ATTACHMENT", array());
                    echo "</dd>
\t\t\t\t";
                }
                $_parent = $context['_parent'];
                unset($context['_seq'], $context['_iterated'], $context['_key'], $context['attachment'], $context['_parent'], $context['loop']);
                $context = array_intersect_key($context, $_parent) + $_parent;
                // line 35
                echo "\t\t\t</dl>
\t\t";
            }
            // line 37
            echo "
\t</div>

\t</div>
</div>
";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['post_review_row'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
        // line 43
        echo "
<hr />
";
    }

    public function getTemplateName()
    {
        return "posting_review.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  143 => 43,  132 => 37,  128 => 35,  119 => 33,  115 => 32,  111 => 31,  108 => 30,  106 => 29,  101 => 27,  91 => 25,  85 => 22,  78 => 21,  72 => 19,  70 => 18,  63 => 16,  59 => 15,  56 => 14,  45 => 11,  40 => 9,  36 => 7,  34 => 6,  30 => 5,  25 => 3,  19 => 1,);
    }
}
/* <h3>{L_POST_REVIEW}</h3>*/
/* */
/* <p>{L_POST_REVIEW_EXPLAIN}</p>*/
/* */
/* <!-- BEGIN post_review_row -->*/
/* <!-- IF post_review_row.S_IGNORE_POST -->*/
/* <div class="post bg3 post-ignore">*/
/* 	<div class="inner">*/
/* 		{post_review_row.L_IGNORE_POST}*/
/* <!-- ELSE -->*/
/* <div class="post <!-- IF post_review_row.S_ROW_COUNT is odd -->bg1<!-- ELSE -->bg2<!-- ENDIF -->">*/
/* 	<div class="inner">*/
/* <!-- ENDIF -->*/
/* */
/* 	<div class="postbody" id="ppr{post_review_row.POST_ID}">*/
/* 		<h3><a href="#ppr{post_review_row.POST_ID}">{post_review_row.POST_SUBJECT}</a></h3>*/
/* 		<p class="author">*/
/* 			<!-- IF S_IS_BOT -->*/
/* 				<span><i class="icon fa-file fa-fw icon-lightgray icon-md" aria-hidden="true"></i><span class="sr-only">{post_review_row.MINI_POST}</span></span>*/
/* 			<!-- ELSE -->*/
/* 				<a href="{post_review_row.U_MINI_POST}" title="{post_review_row.MINI_POST}">*/
/* 					<i class="icon fa-file fa-fw icon-lightgray icon-md" aria-hidden="true"></i><span class="sr-only">{post_review_row.MINI_POST}</span>*/
/* 				</a>*/
/* 			<!-- ENDIF -->*/
/* 			{L_POST_BY_AUTHOR}<strong>  {post_review_row.POST_AUTHOR_FULL}</strong> &raquo; {post_review_row.POST_DATE}*/
/* 		</p>*/
/* 		<div class="content">{post_review_row.MESSAGE}</div>*/
/* */
/* 		<!-- IF post_review_row.S_HAS_ATTACHMENTS -->*/
/* 			<dl class="attachbox">*/
/* 				<dt>{L_ATTACHMENTS}</dt>*/
/* 				<!-- BEGIN attachment -->*/
/* 					<dd>{post_review_row.attachment.DISPLAY_ATTACHMENT}</dd>*/
/* 				<!-- END attachment -->*/
/* 			</dl>*/
/* 		<!-- ENDIF -->*/
/* */
/* 	</div>*/
/* */
/* 	</div>*/
/* </div>*/
/* <!-- END post_review_row -->*/
/* */
/* <hr />*/
/* */
