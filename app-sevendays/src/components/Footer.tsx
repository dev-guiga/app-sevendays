import NextImage from "next/image";
import logo from "@/app/assets/image/logo-seven-days.png";
import logoFacebook from "@/app/assets/image/facebook.svg";
import logoInstagram from "@/app/assets/image/instagram.svg";
import logoLinkedin from "@/app/assets/image/twitter.svg";

export function Footer() {
  return (
    <footer className="w-full bg-accent border-t border-border">
      <div className="w-full max-w-7xl mx-auto px-4 py-10">
        {/* Linha Superior */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo e Descrição */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <NextImage src={logo} alt="Logo" width={40} height={40} />
              <h2 className="text-xl font-bold">Sev7en Days</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Seu horário é nossa prioridade. Agende com praticidade e
              segurança.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-base">Links Rápidos</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Serviços
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-base">Suporte</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Termos de Uso
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-base">Contato</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>📧 contato@sev7endays.com</li>
              <li>📱 (11) 9 9999-9999</li>
              <li>📍 São Paulo, SP</li>
            </ul>
          </div>
        </div>

        {/* Linha Divisória */}
        <div className="border-t border-border my-6"></div>

        {/* Linha Inferior */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sev7en Days. Todos os direitos
            reservados.
          </p>

          {/* Redes Sociais */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <NextImage src={logoFacebook} alt="Logo" width={18} height={18} className="fill-current hover:fill-primary transition-colors" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <NextImage src={logoInstagram} alt="Logo" width={18} height={18} />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <NextImage src={logoLinkedin} alt="Logo" width={18} height={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
